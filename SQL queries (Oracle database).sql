-- USER TABLE
CREATE TABLE users (
    user_id        NUMBER PRIMARY KEY,
    username       VARCHAR2(20) UNIQUE NOT NULL,
    password       VARCHAR2(16) NOT NULL,
    registration_date DATE DEFAULT SYSDATE,
    user_type      VARCHAR2(20) CHECK (user_type IN ('Donor','NGO', 'Volunteer','Admin')) NOT NULL,
    email          VARCHAR2(50) UNIQUE NOT NULL,
    first_name     VARCHAR2(50) NOT NULL,
    last_name      VARCHAR2(50),
    flat_house_block_no VARCHAR2(100),
    city           VARCHAR2(20),
    state          VARCHAR2(20),
    pin_code       NUMBER(6) NOT NULL
);

-- MULTIVALUED ATTRIBUTE (PHONE NUMBERS)
CREATE TABLE user_phone_numbers (
    phone_id  NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id   NUMBER REFERENCES users(user_id) ON DELETE CASCADE,
    phone_number NUMBER(10) NOT NULL
);

-- DONOR TABLE (only for users who are donors)
CREATE TABLE donors (
    donor_id   NUMBER PRIMARY KEY,
    donor_type VARCHAR2(20) CHECK (donor_type IN ('household', 'restaurant', 'office','mess')) NOT NULL,
    CONSTRAINT fk_donor_user FOREIGN KEY (donor_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- NGO TABLE (only for users who are NGOs)
CREATE TABLE ngos (
    ngo_id              NUMBER PRIMARY KEY,
    website             VARCHAR2(30),
    area_of_operation   VARCHAR2(30),
    registration_number NUMBER(6) UNIQUE NOT NULL,
    CONSTRAINT fk_ngo_user FOREIGN KEY (ngo_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- VOLUNTEER TABLE (only for users who are volunteers)
CREATE TABLE volunteers (
    volunteer_id   NUMBER PRIMARY KEY,
    service_area   VARCHAR2(30) NOT NULL,
    max_capacity   NUMBER, 
    CONSTRAINT fk_volunteer_user FOREIGN KEY (volunteer_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE food_donations (
    donation_id    NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    donor_id       NUMBER NOT NULL,
    food_type      VARCHAR2(20) NOT NULL,
    quantity       NUMBER NOT NULL,
    quantity_unit  VARCHAR2(8) CHECK (quantity_unit IN ('kg', 'litre', 'packets', 'pieces', 'other')),
    temperature_requirement VARCHAR2(10),  -- e.g., 'Frozen', 'Hot', 'Room Temp'
    status         VARCHAR2(15) DEFAULT 'available' CHECK (status IN ('available', 'booked', 'collected', 'expired', 'cancelled')),
    description    VARCHAR2(50),
    expiry_date    DATE ,
    created_at     DATE DEFAULT SYSDATE,
    CONSTRAINT fk_donation_donor FOREIGN KEY (donor_id) REFERENCES donors(donor_id) ON DELETE CASCADE
);

CREATE TABLE distribution_requests (
    request_id       NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ngo_id           NUMBER NOT NULL,
    required_by      DATE NOT NULL,   -- deadline for when they want the food
    service_area     VARCHAR2(30),
    description      VARCHAR2(50),
    food_type        VARCHAR2(20),
    quantity_needed  NUMBER NOT NULL,
    quantity_unit    VARCHAR2(8) CHECK (quantity_unit IN ('kg', 'litre', 'packets', 'pieces', 'other')),
    status           VARCHAR2(15) DEFAULT 'open' CHECK (status IN ('open', 'matched', 'fulfilled', 'cancelled')),
    created_at       DATE DEFAULT SYSDATE,
    CONSTRAINT fk_request_ngo FOREIGN KEY (ngo_id) REFERENCES ngos(ngo_id) ON DELETE CASCADE
);

CREATE TABLE donation_matches (
    match_id          NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    donation_id       NUMBER NOT NULL,
    request_id        NUMBER,
    ngo_id            NUMBER NOT NULL,
    volunteer_id      NUMBER,  -- optional (if NGO handles pickup themselves)
    status            VARCHAR2(15) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    scheduled_pickup  DATE,
    created_at        DATE DEFAULT SYSDATE,
    CONSTRAINT fk_match_donation FOREIGN KEY (donation_id) REFERENCES food_donations(donation_id) ON DELETE CASCADE,
    CONSTRAINT fk_match_request FOREIGN KEY (request_id) REFERENCES distribution_requests(request_id) ON DELETE CASCADE,
    CONSTRAINT fk_match_ngo FOREIGN KEY (ngo_id) REFERENCES ngos(ngo_id) ON DELETE CASCADE,
    CONSTRAINT fk_match_volunteer FOREIGN KEY (volunteer_id) REFERENCES volunteers(volunteer_id) ON DELETE SET NULL
);

CREATE TABLE collection_events (
    event_id        NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    match_id        NUMBER NOT NULL,
    collector_id    NUMBER NOT NULL,
    collector_type  VARCHAR2(10) CHECK (collector_type IN ('ngo', 'volunteer')) NOT NULL,
    actual_quantity NUMBER,
    quantity_unit   VARCHAR2(8) CHECK (quantity_unit IN ('kg', 'litre', 'packets', 'pieces', 'other')),
    collection_date DATE DEFAULT SYSDATE,
    collection_status VARCHAR2(15) DEFAULT 'pending' CHECK (collection_status IN ('pending', 'completed', 'failed')),
    notes           VARCHAR2(50),
    CONSTRAINT fk_collection_match FOREIGN KEY (match_id) REFERENCES donation_matches(match_id) ON DELETE CASCADE
);


CREATE TABLE distribution_events (
    event_id          NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    match_id          NUMBER NOT NULL,
    distribution_date DATE DEFAULT SYSDATE,
    distribution_status VARCHAR2(15) DEFAULT 'in_progress' CHECK (distribution_status IN ('in_progress', 'completed', 'failed')),
    people_served     NUMBER,
    notes             VARCHAR2(50),
    location          VARCHAR2(30),
    CONSTRAINT fk_distribution_match FOREIGN KEY (match_id) REFERENCES donation_matches(match_id) ON DELETE CASCADE
);

CREATE TABLE feedbacks (
    feedback_id         NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id             NUMBER NOT NULL,
    rating              NUMBER CHECK (rating BETWEEN 1 AND 5) NOT NULL,
    related_entity_type VARCHAR2(20) CHECK (related_entity_type IN ('donation', 'request', 'match', 'collection', 'distribution', 'ngo', 'volunteer')) NOT NULL,
    related_entity_id   NUMBER NOT NULL,
    comments            VARCHAR2(100),
    created_at          DATE DEFAULT SYSDATE,
    CONSTRAINT fk_feedback_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE OR REPLACE PROCEDURE insert_new_user (
    p_username       IN users.username%TYPE,
    p_password       IN users.password%TYPE,
    p_user_type      IN users.user_type%TYPE,
    p_email          IN users.email%TYPE,
    p_first_name     IN users.first_name%TYPE,
    p_last_name      IN users.last_name%TYPE,
    p_flat_house_block_no IN users.flat_house_block_no%TYPE,
    p_city           IN users.city%TYPE,
    p_state          IN users.state%TYPE,
    p_pin_code       IN users.pin_code%TYPE,
    -- phone numbers
    p_phone_numbers  IN SYS.ODCINUMBERLIST, -- PL/SQL array of phone numbers
    -- donor specific
    p_donor_type     IN donors.donor_type%TYPE DEFAULT NULL,
    -- ngo specific
    p_website        IN ngos.website%TYPE DEFAULT NULL,
    p_area_of_operation IN ngos.area_of_operation%TYPE DEFAULT NULL,
    p_registration_number IN ngos.registration_number%TYPE DEFAULT NULL,
    -- volunteer specific
    p_service_area   IN volunteers.service_area%TYPE DEFAULT NULL,
    p_max_capacity   IN volunteers.max_capacity%TYPE DEFAULT NULL
) AS
    v_user_id users.user_id%TYPE;
BEGIN
    -- Step 1: Insert into users table
    INSERT INTO users (
        username, password, user_type, email, first_name, last_name,
        flat_house_block_no, city, state, pin_code
    )
    VALUES (
        p_username, p_password, p_user_type, p_email, p_first_name, p_last_name,
        p_flat_house_block_no, p_city, p_state, p_pin_code
    )
    RETURNING user_id INTO v_user_id;

    -- Step 2: Insert phone numbers (multi-valued)
    IF p_phone_numbers.COUNT > 0 THEN
        FOR i IN 1..p_phone_numbers.COUNT LOOP
            INSERT INTO user_phone_numbers (user_id, phone_number)
            VALUES (v_user_id, p_phone_numbers(i));
        END LOOP;
    END IF;

    -- Step 3: Insert into role-specific table
    IF p_user_type = 'Donor' THEN
        INSERT INTO donors (donor_id, donor_type)
        VALUES (v_user_id, p_donor_type);

    ELSIF p_user_type = 'NGO' THEN
        INSERT INTO ngos (ngo_id, website, area_of_operation, registration_number)
        VALUES (v_user_id, p_website, p_area_of_operation, p_registration_number);

    ELSIF p_user_type = 'Volunteer' THEN
        INSERT INTO volunteers (volunteer_id, service_area, max_capacity)
        VALUES (v_user_id, p_service_area, p_max_capacity);

    ELSIF p_user_type = 'Admin' THEN
        -- No role table insert needed, admin data only in users table
        NULL;

    ELSE
        RAISE_APPLICATION_ERROR(-20001, 'Invalid user_type. Must be Donor, NGO, Volunteer, or Admin.');
    END IF;

    DBMS_OUTPUT.PUT_LINE('New user inserted with user_id: ' || v_user_id);

EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Error occurred: ' || SQLERRM);
        RAISE;
END;
/


--procedure for donor details 
CREATE OR REPLACE PROCEDURE get_donor_details(p_user_id IN NUMBER)
IS
BEGIN
    FOR rec IN (
        SELECT
            u.user_id,
            u.username,
            u.email,
            u.first_name,
            u.last_name,
            u.city,
            u.state,
            u.pin_code,
            d.donor_type
        FROM
            users u
        JOIN
            donors d ON u.user_id = d.donor_id
        WHERE
            u.user_id = p_user_id
    )
    LOOP
        DBMS_OUTPUT.PUT_LINE('User ID: ' || rec.user_id);
        DBMS_OUTPUT.PUT_LINE('Username: ' || rec.username);
        DBMS_OUTPUT.PUT_LINE('Email: ' || rec.email);
        DBMS_OUTPUT.PUT_LINE('First Name: ' || rec.first_name);
        DBMS_OUTPUT.PUT_LINE('Last Name: ' || rec.last_name);
        DBMS_OUTPUT.PUT_LINE('City: ' || rec.city);
        DBMS_OUTPUT.PUT_LINE('State: ' || rec.state);
        DBMS_OUTPUT.PUT_LINE('Pin Code: ' || rec.pin_code);
        DBMS_OUTPUT.PUT_LINE('Donor Type: ' || rec.donor_type);
    END LOOP;
END;
/


--procedure for ngo details
CREATE OR REPLACE PROCEDURE get_ngo_details(p_user_id IN NUMBER)
IS
BEGIN
    FOR rec IN (
        SELECT
            u.user_id,
            u.username,
            u.email,
            u.first_name,
            u.last_name,
            u.city,
            u.state,
            u.pin_code,
            n.website,
            n.area_of_operation,
            n.registration_number
        FROM
            users u
        JOIN
            ngos n ON u.user_id = n.ngo_id
        WHERE
            u.user_id = p_user_id
    )
    LOOP
        DBMS_OUTPUT.PUT_LINE('User ID: ' || rec.user_id);
        DBMS_OUTPUT.PUT_LINE('Username: ' || rec.username);
        DBMS_OUTPUT.PUT_LINE('Email: ' || rec.email);
        DBMS_OUTPUT.PUT_LINE('First Name: ' || rec.first_name);
        DBMS_OUTPUT.PUT_LINE('Last Name: ' || rec.last_name);
        DBMS_OUTPUT.PUT_LINE('City: ' || rec.city);
        DBMS_OUTPUT.PUT_LINE('State: ' || rec.state);
        DBMS_OUTPUT.PUT_LINE('Pin Code: ' || rec.pin_code);
        DBMS_OUTPUT.PUT_LINE('Website: ' || rec.website);
        DBMS_OUTPUT.PUT_LINE('Area of Operation: ' || rec.area_of_operation);
        DBMS_OUTPUT.PUT_LINE('Registration Number: ' || rec.registration_number);
    END LOOP;
END;
/


--procedure for volunteer details
CREATE OR REPLACE PROCEDURE get_volunteer_details(p_user_id IN NUMBER)
IS
BEGIN
    FOR rec IN (
        SELECT
            u.user_id,
            u.username,
            u.email,
            u.first_name,
            u.last_name,
            u.city,
            u.state,
            u.pin_code,
            v.service_area,
            v.max_capacity
        FROM
            users u
        JOIN
            volunteers v ON u.user_id = v.volunteer_id
        WHERE
            u.user_id = p_user_id
    )
    LOOP
        DBMS_OUTPUT.PUT_LINE('User ID: ' || rec.user_id);
        DBMS_OUTPUT.PUT_LINE('Username: ' || rec.username);
        DBMS_OUTPUT.PUT_LINE('Email: ' || rec.email);
        DBMS_OUTPUT.PUT_LINE('First Name: ' || rec.first_name);
        DBMS_OUTPUT.PUT_LINE('Last Name: ' || rec.last_name);
        DBMS_OUTPUT.PUT_LINE('City: ' || rec.city);
        DBMS_OUTPUT.PUT_LINE('State: ' || rec.state);
        DBMS_OUTPUT.PUT_LINE('Pin Code: ' || rec.pin_code);
        DBMS_OUTPUT.PUT_LINE('Service Area: ' || rec.service_area);
        DBMS_OUTPUT.PUT_LINE('Max Capacity: ' || rec.max_capacity);
    END LOOP;
END;
/


--display all donors
CREATE OR REPLACE PROCEDURE get_all_donors
IS
BEGIN
    FOR rec IN (
        SELECT
            u.user_id,
            u.username,
            u.email,
            u.first_name,
            u.last_name,
            u.city,
            u.state,
            u.pin_code,
            d.donor_type
        FROM
            users u
        JOIN
            donors d ON u.user_id = d.donor_id
    )
    LOOP
        DBMS_OUTPUT.PUT_LINE('------------------------------');
        DBMS_OUTPUT.PUT_LINE('User ID: ' || rec.user_id);
        DBMS_OUTPUT.PUT_LINE('Username: ' || rec.username);
        DBMS_OUTPUT.PUT_LINE('Email: ' || rec.email);
        DBMS_OUTPUT.PUT_LINE('First Name: ' || rec.first_name);
        DBMS_OUTPUT.PUT_LINE('Last Name: ' || rec.last_name);
        DBMS_OUTPUT.PUT_LINE('City: ' || rec.city);
        DBMS_OUTPUT.PUT_LINE('State: ' || rec.state);
        DBMS_OUTPUT.PUT_LINE('Pin Code: ' || rec.pin_code);
        DBMS_OUTPUT.PUT_LINE('Donor Type: ' || rec.donor_type);
    END LOOP;
END;
/


--procedure to display all ngo
CREATE OR REPLACE PROCEDURE get_all_ngos
IS
BEGIN
    FOR rec IN (
        SELECT
            u.user_id,
            u.username,
            u.email,
            u.first_name,
            u.last_name,
            u.city,
            u.state,
            u.pin_code,
            n.website,
            n.area_of_operation,
            n.registration_number
        FROM
            users u
        JOIN
            ngos n ON u.user_id = n.ngo_id
    )
    LOOP
        DBMS_OUTPUT.PUT_LINE('------------------------------');
        DBMS_OUTPUT.PUT_LINE('User ID: ' || rec.user_id);
        DBMS_OUTPUT.PUT_LINE('Username: ' || rec.username);
        DBMS_OUTPUT.PUT_LINE('Email: ' || rec.email);
        DBMS_OUTPUT.PUT_LINE('First Name: ' || rec.first_name);
        DBMS_OUTPUT.PUT_LINE('Last Name: ' || rec.last_name);
        DBMS_OUTPUT.PUT_LINE('City: ' || rec.city);
        DBMS_OUTPUT.PUT_LINE('State: ' || rec.state);
        DBMS_OUTPUT.PUT_LINE('Pin Code: ' || rec.pin_code);
        DBMS_OUTPUT.PUT_LINE('Website: ' || rec.website);
        DBMS_OUTPUT.PUT_LINE('Area of Operation: ' || rec.area_of_operation);
        DBMS_OUTPUT.PUT_LINE('Registration Number: ' || rec.registration_number);
    END LOOP;
END;
/


--procedure to display all volunteers
CREATE OR REPLACE PROCEDURE get_all_volunteers
IS
BEGIN
    FOR rec IN (
        SELECT
            u.user_id,
            u.username,
            u.email,
            u.first_name,
            u.last_name,
            u.city,
            u.state,
            u.pin_code,
            v.service_area,
            v.max_capacity
        FROM
            users u
        JOIN
            volunteers v ON u.user_id = v.volunteer_id
    )
    LOOP
        DBMS_OUTPUT.PUT_LINE('------------------------------');
        DBMS_OUTPUT.PUT_LINE('User ID: ' || rec.user_id);
        DBMS_OUTPUT.PUT_LINE('Username: ' || rec.username);
        DBMS_OUTPUT.PUT_LINE('Email: ' || rec.email);
        DBMS_OUTPUT.PUT_LINE('First Name: ' || rec.first_name);
        DBMS_OUTPUT.PUT_LINE('Last Name: ' || rec.last_name);
        DBMS_OUTPUT.PUT_LINE('City: ' || rec.city);
        DBMS_OUTPUT.PUT_LINE('State: ' || rec.state);
        DBMS_OUTPUT.PUT_LINE('Pin Code: ' || rec.pin_code);
        DBMS_OUTPUT.PUT_LINE('Service Area: ' || rec.service_area);
        DBMS_OUTPUT.PUT_LINE('Max Capacity: ' || rec.max_capacity);
    END LOOP;
END;
/


--insert into food donation 
CREATE OR REPLACE PROCEDURE insert_food_donation (
    p_donor_id              IN NUMBER,
    p_food_type             IN VARCHAR2,
    p_quantity              IN NUMBER,
    p_quantity_unit         IN VARCHAR2,
    p_temperature_requirement IN VARCHAR2,
    p_description           IN VARCHAR2,
    p_expiry_date           IN DATE
)
IS
BEGIN
    INSERT INTO food_donations (
        donor_id, food_type, quantity, quantity_unit,
        temperature_requirement, description, expiry_date
    )
    VALUES (
        p_donor_id, p_food_type, p_quantity, p_quantity_unit,
        p_temperature_requirement, p_description, p_expiry_date
    );

    DBMS_OUTPUT.PUT_LINE('Food donation record inserted successfully.');
END;
/

--insert into distribution requests 
CREATE OR REPLACE PROCEDURE insert_distribution_request (
    p_ngo_id           IN NUMBER,
    p_required_by      IN DATE,
    p_service_area     IN VARCHAR2,
    p_description      IN VARCHAR2,
    p_food_type        IN VARCHAR2,
    p_quantity_needed  IN NUMBER,
    p_quantity_unit    IN VARCHAR2
)
IS
BEGIN
    INSERT INTO distribution_requests (
        ngo_id, required_by, service_area, description,
        food_type, quantity_needed, quantity_unit
    )
    VALUES (
        p_ngo_id, p_required_by, p_service_area, p_description,
        p_food_type, p_quantity_needed, p_quantity_unit
    );

    DBMS_OUTPUT.PUT_LINE('Distribution request inserted successfully.');
END;
/


--display all donors
CREATE OR REPLACE PROCEDURE get_all_donors
IS
BEGIN
    FOR rec IN (
        SELECT
            u.user_id,
            u.username,
            u.email,
            u.first_name,
            u.last_name,
            u.city,
            u.state,
            u.pin_code,
            d.donor_type
        FROM
            users u
        JOIN
            donors d ON u.user_id = d.donor_id
    )
    LOOP
        DBMS_OUTPUT.PUT_LINE('------------------------------');
        DBMS_OUTPUT.PUT_LINE('User ID: ' || rec.user_id);
        DBMS_OUTPUT.PUT_LINE('Username: ' || rec.username);
        DBMS_OUTPUT.PUT_LINE('Email: ' || rec.email);
        DBMS_OUTPUT.PUT_LINE('First Name: ' || rec.first_name);
        DBMS_OUTPUT.PUT_LINE('Last Name: ' || rec.last_name);
        DBMS_OUTPUT.PUT_LINE('City: ' || rec.city);
        DBMS_OUTPUT.PUT_LINE('State: ' || rec.state);
        DBMS_OUTPUT.PUT_LINE('Pin Code: ' || rec.pin_code);
        DBMS_OUTPUT.PUT_LINE('Donor Type: ' || rec.donor_type);
    END LOOP;
END;
/


--procedure to display all ngo
CREATE OR REPLACE PROCEDURE get_all_ngos
IS
BEGIN
    FOR rec IN (
        SELECT
            u.user_id,
            u.username,
            u.email,
            u.first_name,
            u.last_name,
            u.city,
            u.state,
            u.pin_code,
            n.website,
            n.area_of_operation,
            n.registration_number
        FROM
            users u
        JOIN
            ngos n ON u.user_id = n.ngo_id
    )
    LOOP
        DBMS_OUTPUT.PUT_LINE('------------------------------');
        DBMS_OUTPUT.PUT_LINE('User ID: ' || rec.user_id);
        DBMS_OUTPUT.PUT_LINE('Username: ' || rec.username);
        DBMS_OUTPUT.PUT_LINE('Email: ' || rec.email);
        DBMS_OUTPUT.PUT_LINE('First Name: ' || rec.first_name);
        DBMS_OUTPUT.PUT_LINE('Last Name: ' || rec.last_name);
        DBMS_OUTPUT.PUT_LINE('City: ' || rec.city);
        DBMS_OUTPUT.PUT_LINE('State: ' || rec.state);
        DBMS_OUTPUT.PUT_LINE('Pin Code: ' || rec.pin_code);
        DBMS_OUTPUT.PUT_LINE('Website: ' || rec.website);
        DBMS_OUTPUT.PUT_LINE('Area of Operation: ' || rec.area_of_operation);
        DBMS_OUTPUT.PUT_LINE('Registration Number: ' || rec.registration_number);
    END LOOP;
END;
/


--procedure to display all volunteers
CREATE OR REPLACE PROCEDURE get_all_volunteers
IS
BEGIN
    FOR rec IN (
        SELECT
            u.user_id,
            u.username,
            u.email,
            u.first_name,
            u.last_name,
            u.city,
            u.state,
            u.pin_code,
            v.service_area,
            v.max_capacity
        FROM
            users u
        JOIN
            volunteers v ON u.user_id = v.volunteer_id
    )
    LOOP
        DBMS_OUTPUT.PUT_LINE('------------------------------');
        DBMS_OUTPUT.PUT_LINE('User ID: ' || rec.user_id);
        DBMS_OUTPUT.PUT_LINE('Username: ' || rec.username);
        DBMS_OUTPUT.PUT_LINE('Email: ' || rec.email);
        DBMS_OUTPUT.PUT_LINE('First Name: ' || rec.first_name);
        DBMS_OUTPUT.PUT_LINE('Last Name: ' || rec.last_name);
        DBMS_OUTPUT.PUT_LINE('City: ' || rec.city);
        DBMS_OUTPUT.PUT_LINE('State: ' || rec.state);
        DBMS_OUTPUT.PUT_LINE('Pin Code: ' || rec.pin_code);
        DBMS_OUTPUT.PUT_LINE('Service Area: ' || rec.service_area);
        DBMS_OUTPUT.PUT_LINE('Max Capacity: ' || rec.max_capacity);
    END LOOP;
END;
/


--update status food donation
CREATE OR REPLACE PROCEDURE update_food_donation_status (
    p_donation_id IN NUMBER,
    p_new_status  IN VARCHAR2
)
IS
BEGIN
    UPDATE food_donations
    SET status = p_new_status
    WHERE donation_id = p_donation_id;

    IF SQL%ROWCOUNT = 0 THEN
        DBMS_OUTPUT.PUT_LINE('No food donation found with ID: ' || p_donation_id);
    ELSE
        DBMS_OUTPUT.PUT_LINE('Food donation status updated successfully.');
    END IF;
END;
/


--update status distribution requests 
CREATE OR REPLACE PROCEDURE update_distribution_request_status (
    p_request_id IN NUMBER,
    p_new_status IN VARCHAR2
)
IS
BEGIN
    UPDATE distribution_requests
    SET status = p_new_status
    WHERE request_id = p_request_id;

    IF SQL%ROWCOUNT = 0 THEN
        DBMS_OUTPUT.PUT_LINE('No distribution request found with ID: ' || p_request_id);
    ELSE
        DBMS_OUTPUT.PUT_LINE('Distribution request status updated successfully.');
    END IF;
END;
/


--update status - donation matches
CREATE OR REPLACE PROCEDURE update_donation_match_status (
    p_match_id   IN NUMBER,
    p_new_status IN VARCHAR2
)
IS
BEGIN
    UPDATE donation_matches
    SET status = p_new_status
    WHERE match_id = p_match_id;

    IF SQL%ROWCOUNT = 0 THEN
        DBMS_OUTPUT.PUT_LINE('No donation match found with ID: ' || p_match_id);
    ELSE
        DBMS_OUTPUT.PUT_LINE('Donation match status updated successfully.');
    END IF;
END;
/


--update collection event
CREATE OR REPLACE PROCEDURE update_collection_event_status (
    p_event_id      IN NUMBER,
    p_new_status    IN VARCHAR2
)
IS
BEGIN
    UPDATE collection_events
    SET collection_status = p_new_status
    WHERE event_id = p_event_id;

    IF SQL%ROWCOUNT = 0 THEN
        DBMS_OUTPUT.PUT_LINE('No collection event found with ID: ' || p_event_id);
    ELSE
        DBMS_OUTPUT.PUT_LINE('Collection event status updated successfully.');
    END IF;
END;
/

--delete record food donation
CREATE OR REPLACE PROCEDURE delete_food_donation (
    p_donation_id IN NUMBER
)
IS
BEGIN
    DELETE FROM food_donations
    WHERE donation_id = p_donation_id;

    IF SQL%ROWCOUNT = 0 THEN
        DBMS_OUTPUT.PUT_LINE('No food donation found with ID: ' || p_donation_id);
    ELSE
        DBMS_OUTPUT.PUT_LINE('Food donation deleted successfully.');
    END IF;
END;
/

--delete record distribution requests
CREATE OR REPLACE PROCEDURE delete_distribution_request (
    p_request_id IN NUMBER
)
IS
BEGIN
    DELETE FROM distribution_requests
    WHERE request_id = p_request_id;

    IF SQL%ROWCOUNT = 0 THEN
        DBMS_OUTPUT.PUT_LINE('No distribution request found with ID: ' || p_request_id);
    ELSE
        DBMS_OUTPUT.PUT_LINE('Distribution request deleted successfully.');
    END IF;
END;
/


--delete record - donation matches
CREATE OR REPLACE PROCEDURE delete_donation_match (
    p_match_id IN NUMBER
)
IS
BEGIN
    DELETE FROM donation_matches
    WHERE match_id = p_match_id;

    IF SQL%ROWCOUNT = 0 THEN
        DBMS_OUTPUT.PUT_LINE('No donation match found with ID: ' || p_match_id);
    ELSE
        DBMS_OUTPUT.PUT_LINE('Donation match deleted successfully.');
    END IF;
END;
/


--delete collection event
CREATE OR REPLACE PROCEDURE delete_collection_event (
    p_event_id IN NUMBER
)
IS
BEGIN
    DELETE FROM collection_events
    WHERE event_id = p_event_id;

    IF SQL%ROWCOUNT = 0 THEN
        DBMS_OUTPUT.PUT_LINE('No collection event found with ID: ' || p_event_id);
    ELSE
        DBMS_OUTPUT.PUT_LINE('Collection event deleted successfully.');
    END IF;
END;
/


--collection event
CREATE OR REPLACE PROCEDURE insert_collection_event (
    p_match_id         IN NUMBER,
    p_collector_id     IN NUMBER,
    p_collector_type   IN VARCHAR2,
    p_actual_quantity  IN NUMBER,
    p_quantity_unit    IN VARCHAR2,
    p_collection_date  IN DATE,
    p_collection_status IN VARCHAR2,
    p_notes            IN VARCHAR2
)
IS
BEGIN
    INSERT INTO collection_events (
        match_id, collector_id, collector_type, actual_quantity, quantity_unit,
        collection_date, collection_status, notes
    ) VALUES (
        p_match_id, p_collector_id, p_collector_type, p_actual_quantity, p_quantity_unit,
        NVL(p_collection_date, SYSDATE), p_collection_status, p_notes
    );

    DBMS_OUTPUT.PUT_LINE('Collection event inserted successfully.');
END;
/


--insert distribution event
CREATE OR REPLACE PROCEDURE insert_distribution_event (
    p_match_id            IN NUMBER,
    p_distribution_date   IN DATE,
    p_distribution_status IN VARCHAR2,
    p_people_served       IN NUMBER,
    p_notes               IN VARCHAR2,
    p_location            IN VARCHAR2
)
IS
BEGIN
    INSERT INTO distribution_events (
        match_id, distribution_date, distribution_status, people_served, notes, location
    ) VALUES (
        p_match_id, NVL(p_distribution_date, SYSDATE), p_distribution_status, p_people_served, p_notes, p_location
    );

    DBMS_OUTPUT.PUT_LINE('Distribution event inserted successfully.');
END;
/


--update distribution events 
CREATE OR REPLACE PROCEDURE update_distribution_event_status (
    p_event_id   IN NUMBER,
    p_new_status IN VARCHAR2
)
IS
BEGIN
    UPDATE distribution_events
    SET distribution_status = p_new_status
    WHERE event_id = p_event_id;

    IF SQL%ROWCOUNT = 0 THEN
        DBMS_OUTPUT.PUT_LINE('No distribution event found with ID: ' || p_event_id);
    ELSE
        DBMS_OUTPUT.PUT_LINE('Distribution event status updated successfully.');
    END IF;
END;
/


--delete distribution event
CREATE OR REPLACE PROCEDURE delete_distribution_event (
    p_event_id IN NUMBER
)
IS
BEGIN
    DELETE FROM distribution_events
    WHERE event_id = p_event_id;

    IF SQL%ROWCOUNT = 0 THEN
        DBMS_OUTPUT.PUT_LINE('No distribution event found with ID: ' || p_event_id);
    ELSE
        DBMS_OUTPUT.PUT_LINE('Distribution event deleted successfully.');
    END IF;
END;
/

--insert feedback 
CREATE OR REPLACE PROCEDURE insert_feedback (
    p_user_id            IN NUMBER,
    p_rating             IN NUMBER,
    p_related_entity_type IN VARCHAR2,
    p_related_entity_id  IN NUMBER,
    p_comments           IN VARCHAR2
)
IS
BEGIN
    INSERT INTO feedbacks (
        user_id, rating, related_entity_type, related_entity_id, comments
    ) VALUES (
        p_user_id, p_rating, p_related_entity_type, p_related_entity_id, p_comments
    );

    DBMS_OUTPUT.PUT_LINE('Feedback inserted successfully.');
END;
/


--update feedback
CREATE OR REPLACE PROCEDURE update_feedback_comments (
    p_feedback_id IN NUMBER,
    p_new_comments IN VARCHAR2
)
IS
BEGIN
    UPDATE feedbacks
    SET comments = p_new_comments
    WHERE feedback_id = p_feedback_id;

    IF SQL%ROWCOUNT = 0 THEN
        DBMS_OUTPUT.PUT_LINE('No feedback found with ID: ' || p_feedback_id);
    ELSE
        DBMS_OUTPUT.PUT_LINE('Feedback comments updated successfully.');
    END IF;
END;
/


--delete feedback
CREATE OR REPLACE PROCEDURE delete_feedback (
    p_feedback_id IN NUMBER
)
IS
BEGIN
    DELETE FROM feedbacks
    WHERE feedback_id = p_feedback_id;

    IF SQL%ROWCOUNT = 0 THEN
        DBMS_OUTPUT.PUT_LINE('No feedback found with ID: ' || p_feedback_id);
    ELSE
        DBMS_OUTPUT.PUT_LINE('Feedback deleted successfully.');
    END IF;
END;
/


CREATE OR REPLACE PROCEDURE view_feedback_by_id (p_feedback_id IN NUMBER)
IS
    rec feedbacks%ROWTYPE;
BEGIN
    SELECT * INTO rec
    FROM feedbacks
    WHERE feedback_id = p_feedback_id;

    DBMS_OUTPUT.PUT_LINE('Feedback ID: ' || rec.feedback_id || 
                         ' | User ID: ' || rec.user_id ||
                         ' | Rating: ' || rec.rating ||
                         ' | Entity Type: ' || rec.related_entity_type ||
                         ' | Entity ID: ' || rec.related_entity_id ||
                         ' | Comments: ' || rec.comments ||
                         ' | Date: ' || TO_CHAR(rec.created_at, 'DD-MON-YYYY'));
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        DBMS_OUTPUT.PUT_LINE('No feedback found with ID: ' || p_feedback_id);
END;
/

----------------------------------------------------------------------------------
ALTER TABLE users MODIFY user_id 
NUMBER GENERATED BY DEFAULT AS IDENTITY;
SELECT * FROM USERS;

ALTER TABLE ngos
MODIFY (website VARCHAR(40));

SELECT object_name,
       status
FROM   user_objects
WHERE  object_type = 'PROCEDURE';

-- Insert User
CREATE OR REPLACE PROCEDURE insert_user (
    p_username IN users.username%TYPE,
    p_password IN users.password%TYPE,
    p_user_type IN users.user_type%TYPE,
    p_email IN users.email%TYPE,
    p_first_name IN users.first_name%TYPE,
    p_last_name IN users.last_name%TYPE,
    p_flat_house_block_no IN users.flat_house_block_no%TYPE,
    p_city IN users.city%TYPE,
    p_state IN users.state%TYPE,
    p_pin_code IN users.pin_code%TYPE
)
IS
BEGIN
    INSERT INTO users (username, password, user_type, email, first_name, last_name, flat_house_block_no, city, state, pin_code)
    VALUES (p_username, p_password, p_user_type, p_email, p_first_name, p_last_name, p_flat_house_block_no, p_city, p_state, p_pin_code);
END;
/

-- Update User Email and Address
CREATE OR REPLACE PROCEDURE update_user_details (
    p_user_id IN users.user_id%TYPE,
    p_email IN users.email%TYPE,
    p_flat_house_block_no IN users.flat_house_block_no%TYPE,
    p_city IN users.city%TYPE,
    p_state IN users.state%TYPE,
    p_pin_code IN users.pin_code%TYPE
)
IS
BEGIN
    UPDATE users
    SET email = p_email,
        flat_house_block_no = p_flat_house_block_no,
        city = p_city,
        state = p_state,
        pin_code = p_pin_code
    WHERE user_id = p_user_id;
END;
/

-- Delete User (CASCADE deletes in sub-tables)
CREATE OR REPLACE PROCEDURE delete_user (
    p_user_id IN users.user_id%TYPE
)
IS
BEGIN
    DELETE FROM users WHERE user_id = p_user_id;
END;
/

--show available donation
CREATE OR REPLACE PROCEDURE show_available_donations
IS
BEGIN
    DBMS_OUTPUT.PUT_LINE('Available Food Donations:');
    DBMS_OUTPUT.PUT_LINE('ID | Food Type | Quantity | Unit | Expiry Date');

    FOR rec IN (
        SELECT donation_id, food_type, quantity, quantity_unit, expiry_date
        FROM food_donations
        WHERE status = 'available'
    ) LOOP
        DBMS_OUTPUT.PUT_LINE(rec.donation_id || ' | ' ||
                             rec.food_type || ' | ' ||
                             rec.quantity || ' | ' ||
                             rec.quantity_unit || ' | ' ||
                             TO_CHAR(rec.expiry_date, 'DD-MON-YYYY'));
    END LOOP;
END;
/

-- book food donation
BEGIN
    show_available_donations();
END;
/
DECLARE
    v_donation_id number;
    v_request_id number;
    v_ngo_id number;
    v_request_input VARCHAR2(10);
    v_status food_donations.status%TYPE;

BEGIN
    DBMS_OUTPUT.PUT_LINE('Enter the Donation ID you want to book:');
    v_donation_id := TO_NUMBER('&donation_id');

    DBMS_OUTPUT.PUT_LINE('Enter your NGO ID:');
    v_ngo_id := TO_NUMBER('&ngo_id');

    DBMS_OUTPUT.PUT_LINE('Do you have a request ID? (yes/no):');
    v_request_input := LOWER('&has_request');
    
    SELECT status INTO v_status
    FROM food_donations
    WHERE donation_id = v_donation_id;

    IF v_status != 'available' THEN
        RAISE_APPLICATION_ERROR(-20001, 'Selected donation is no longer available.');
    END IF;

    update_food_donation_status(v_donation_id, 'booked');

    IF v_request_input = 'yes' THEN
        DBMS_OUTPUT.PUT_LINE('Enter the associated Request ID:');
        v_request_id := TO_NUMBER('&request_id');

        INSERT INTO donation_matches (
            donation_id, request_id, ngo_id, status, scheduled_pickup
        ) VALUES (
            v_donation_id, v_request_id, v_ngo_id, 'scheduled', SYSDATE + 1
        );

    ELSIF v_request_input = 'no' THEN
        INSERT INTO donation_matches (
            donation_id, ngo_id, status, scheduled_pickup
        ) VALUES (
            v_donation_id, v_ngo_id, 'scheduled', SYSDATE + 1
        );
    ELSE
        RAISE_APPLICATION_ERROR(-20004, 'Invalid input for request ID (expected yes/no).');
    END IF;

    DBMS_OUTPUT.PUT_LINE('Donation booked successfully and match record created.');

EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RAISE_APPLICATION_ERROR(-20002, 'Donation ID not found.');
    WHEN OTHERS THEN
        RAISE_APPLICATION_ERROR(-20003, 'Error: ' || SQLERRM);
END;

SET SERVEROUTPUT ON
BEGIN
insert_new_user(
    p_user_id => 1,
    p_username => 'ngo_hope',
    p_password => 'hopeNGO',
    p_user_type => 'NGO',
    p_email => 'hope@ngo.org',
    p_first_name => 'Hope',
    p_last_name => 'Trust',
    p_flat_house_block_no => 'NGO Complex',
    p_city => 'Hyderabad',
    p_state => 'Telangana',
    p_pin_code => 500001,
    p_phone_numbers => SYS.ODCINUMBERLIST(9988776655),
    p_website => 'www.hopengo.org',
    p_area_of_operation => 'Hyderabad',
    p_registration_number => 123456
);
END;

SET SERVEROUTPUT ON
BEGIN 
GET_ngo_DETAILS(21001);
END;

SET SERVEROUTPUT ON
BEGIN
insert_distribution_request(
21001,
'02-may-25',
'Hoshiarpur',
'required food for 50 homeless people',
'lunch',
50,
'packets'
);
END;

SET SERVEROUTPUT ON
BEGIN
insert_food_donation(
7312,
'lunch',
5,
'kg',
'thanda',
'yummy yummy food',
'05-may-25'
);
END;


SET SERVEROUTPUT ON
BEGIN
book_food_donation(
1,
28252
);
END;
/

select * from user_constraints
where table_name='donation_matches';

SELECT object_name,
       status
FROM   user_objects
WHERE  object_type = 'PROCEDURE';