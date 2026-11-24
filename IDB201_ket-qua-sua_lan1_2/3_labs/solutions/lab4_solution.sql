/* IDB201 Lab 4 - sample solution (lecturer copy): clinic database. */
use master;
go
if db_id(N'Clinic') is not null
begin
    alter database Clinic set single_user with rollback immediate;
    drop database Clinic;
end
go
create database Clinic;
go
use Clinic;
go
create table department (
    dept_code varchar(6) primary key,
    name      varchar(40) not null unique,
    floor     int not null check (floor between 0 and 20),
    head_id   varchar(6) null            -- foreign key added after doctor
);
create table doctor (
    doctor_id  varchar(6) primary key,
    first_name varchar(30) not null,
    last_name  varchar(30) not null,
    phone      varchar(15) null,
    dept_code  varchar(6) not null references department (dept_code)  -- total participation
);
alter table department add constraint fk_dept_head
    foreign key (head_id) references doctor (doctor_id);
create unique index ux_dept_head on department (head_id) where head_id is not null; -- one head per doctor
create table doctor_specialty (                                          -- multivalued attribute
    doctor_id varchar(6) references doctor (doctor_id) on delete cascade,
    specialty varchar(40),
    primary key (doctor_id, specialty)
);
create table patient (
    patient_id    varchar(8) primary key,
    first_name    varchar(30) not null,
    last_name     varchar(30) not null,
    date_of_birth date not null,
    street        varchar(60) null,                                      -- composite address
    city          varchar(30) null
);
create table patient_phone (
    patient_id varchar(8) references patient (patient_id) on delete cascade,
    phone      varchar(15),
    primary key (patient_id, phone)
);
create table ward (
    ward_no   int primary key,
    name      varchar(30) not null,
    dept_code varchar(6) not null references department (dept_code)
);
create table bed (                                                       -- weak entity set
    ward_no int references ward (ward_no) on delete cascade,
    bed_no  int check (bed_no > 0),
    primary key (ward_no, bed_no)
);
create table occupies (                                                  -- one-to-one, partial
    patient_id varchar(8) primary key references patient (patient_id),
    ward_no    int not null,
    bed_no     int not null,
    admitted   date not null,
    unique (ward_no, bed_no),
    foreign key (ward_no, bed_no) references bed (ward_no, bed_no)
);
create table drug (
    drug_code  varchar(10) primary key,
    name       varchar(40) not null,
    unit_price numeric(8,2) not null check (unit_price >= 0)
);
create table prescribes (                                                -- ternary relationship
    doctor_id  varchar(6) references doctor (doctor_id),
    patient_id varchar(8) references patient (patient_id),
    drug_code  varchar(10) references drug (drug_code),
    presc_date date not null,
    dosage     varchar(40) not null,
    primary key (doctor_id, patient_id, drug_code)
);
go
create view patient_age as                                               -- derived attribute
    select patient_id,
           datediff(year, date_of_birth, cast(getdate() as date))
         - case when dateadd(year, datediff(year, date_of_birth, cast(getdate() as date)), date_of_birth)
                     > cast(getdate() as date) then 1 else 0 end as age
    from patient;
go
insert into department values ('CARD', 'Cardiology', 2, null), ('PED', 'Paediatrics', 3, null);
insert into doctor values ('D1', 'Mai', 'Tran', null, 'CARD'), ('D2', 'Hung', 'Le', null, 'PED');
update department set head_id = 'D1' where dept_code = 'CARD';
insert into patient values ('P1', 'Lan', 'Vo', '1990-05-01', null, 'Hanoi'),
                           ('P2', 'Tuan', 'Do', '2015-11-20', null, 'Hue');
insert into drug values ('X', 'Drug X', 1.50), ('Y', 'Drug Y', 4.00);
insert into prescribes values
 ('D1', 'P1', 'X', '2026-10-01', '2 x daily'),
 ('D1', 'P2', 'Y', '2026-10-02', '1 x daily'),
 ('D2', 'P1', 'Y', '2026-10-03', '1 x daily');
go
-- Investigate: replace the ternary relationship by three binary ones
select distinct doctor_id, patient_id into dp from prescribes;
select distinct patient_id, drug_code into px from prescribes;
select distinct doctor_id,  drug_code into dx from prescribes;
select dp.doctor_id, dp.patient_id, px.drug_code
from   dp join px on px.patient_id = dp.patient_id
          join dx on dx.doctor_id = dp.doctor_id and dx.drug_code = px.drug_code
except
select doctor_id, patient_id, drug_code from prescribes;   -- spurious: D1, P1, Y
select count(*) as joined_rows
from   dp join px on px.patient_id = dp.patient_id
          join dx on dx.doctor_id = dp.doctor_id and dx.drug_code = px.drug_code;
go
