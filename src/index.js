const express = require("express");
require('express-async-errors');
const cors = require("cors");

const database = require("./database");
const { onlyNumber } = require('./utils');

const app = express();

app.use(cors());
app.use(express.json());

app.use((request, response, next) => {
    const { method, url } = request;
    const logLabel = `[${method.toUpperCase()}] ${url}`;
    console.time(logLabel);
    next();
    console.timeEnd(logLabel);
});

app.get("/contatos", async (request, response) => {
    const { name, email } = request.query;

    let queryRef = database("contacts").select("*");

    if (name && name.length > 0) {
        queryRef = queryRef.whereRaw(
            `CONCAT(firstName, ' ', lastName) LIKE '%${name}%'`
        );
    }

    if (email && email.length > 0) {
        queryRef = queryRef.where('email', email);
    }

    const contacts = await queryRef;

    await Promise.all(contacts.map(async contact => {
        contact.phones = await database('phones').where('contact_id', contact.id);
    }));

    return response.json(contacts);
});

app.post("/contatos", async (request, response) => {
    const { firstName, lastName, email, phones } = request.body;
    const transaction = await database.transaction();

    try {
        const [insertedId] = await database('contacts')
            .transacting(transaction)
            .insert({
                firstName,
                lastName,
                email
            });

        if (!Array.isArray(phones)) {
            response.status(405).send({ "error": "Telefone precisa ser um array" });
        }

        if (phones.length <= 0) {
            response.status(405).send({ "error": "Você deve enviar pelo menos um telefone." });

        }

        await Promise.all(phones.map(async phone => {
            await database('phones')
                .transacting(transaction)
                .insert({
                    number: onlyNumber(phone),
                    contact_id: insertedId
                });
        }));

        const newContact = await database('contacts')
            .transacting(transaction)
            .where('id', insertedId)
            .first();

        const newPhones = await database('phones')
            .transacting(transaction)
            .where('contact_id', insertedId);

        await transaction.commit();

        return response.json({
            contact: newContact,
            phones: newPhones
        });
    } catch (e) {
        await transaction.rollback();
        response.status(405).send({ "error": e });
    }
});

app.delete('/contatos/:id', async (request, response) => {
    const { id } = request.params;

    const rowContact = await database('contacts')
        .where('id', id)
        .first();

    if (!rowContact) {
        throw new Error("Contato não encontrado.");
    }

    await database('contacts')
        .where('id', rowContact.id)
        .delete();

    return response.status(204).send();
});

app.put('/contatos/:id', async (request, response) => {
    const { id } = request.params;
    const { firstName, lastName, email, phones } = request.body;
    const transaction = await database.transaction();

    try {
        const rowContact = await database('contacts')
            .where('id', id)
            .first();

        if (!rowContact) {
            throw new Error("Contato não encontrado.");
        }

        await database('contacts')
            .where('id', rowContact.id)
            .transacting(transaction)
            .update({
                firstName,
                lastName,
                email
            });

        if (Array.isArray(phones)) {
            await Promise.all(phones.map(async phone => {
                const rowPhone = await database('phones')
                    .where('number', onlyNumber(phone))
                    .first();

                if (!rowPhone) {
                    await database('phones')
                        .transacting(transaction)
                        .insert({
                            number: onlyNumber(phone),
                            contact_id: rowContact.id
                        });
                }
            }));
        }

        const rowsPhones = phones
            ? await database('phones')
                .transacting(transaction)
                .where('contact_id', rowContact.id)
            : undefined;

        await transaction.commit();

        return response.json({
            contact: {
                ...rowContact,
                ...{
                    firstName,
                    lastName,
                    email
                }
            },
            phones: rowsPhones
        });
    } catch (e) {
        await transaction.rollback();

        throw e;
    }
});


app.use((
    error,
    _request,
    response,
    _next
) => {
    return response.json({
        error: true,
        message: error.message
    });
});

const port = process.env.PORT || 8080;

app.listen(port, () => {
    console.log("🙌 Servidor iniciado", port);
});
