create table contacts
(
    id int auto_increment
        primary key,
    firstName varchar(191) not null,
    lastName varchar(191) not null,
    email varchar(191) not null,
    constraint email
        unique (email)
);

create index id
    on contacts (id);

	create table phones
(
    id int auto_increment,
    number varchar(11) not null,
    contact_id int not null,
    constraint id
        unique (id),
    constraint phones_number_contact_id_uindex
        unique (number, contact_id),
    constraint phones_contatos_id_fk
        foreign key (contact_id) references contacts (id)
            on update cascade on delete cascade
);

create index phones_contato_id_index
    on phones (contact_id);

create index phones_id_index
    on phones (id);

create index phones_number_index
    on phones (number);