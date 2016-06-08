SET GLOBAL general_log = 'OFF';
SET GLOBAL general_log = 'ON';

Select * from tblUsers;
Select * from tblBooks;

DROP TABLE tblBooks;
DROP TABLE tblUsers;

CREATE TABLE tblUsers 
(
	Id CHAR(36),
	UserName VARCHAR(100),
	Password VARCHAR(200),
	Email VARCHAR(200),
	RegistrationDate DATETIME,
	RetryAttempts INT,
	IsLocked INT,
	LockedDateTime DATETIME,
  CONSTRAINT pk_users_id PRIMARY KEY (Id),  
  CONSTRAINT ck_users_id CHECK (Id REGEXP '[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}')
);

ALTER TABLE tblUsers 
  ADD IsActivated INT AFTER LockedDateTime;

CREATE TABLE tblBooks 
(
  Id CHAR(36),
  Title VARCHAR(100),
  Category VARCHAR(100),
  Description TEXT,
  AuthorId CHAR(36),
  Path VARCHAR(255),
  AdditionDate DATETIME,
  IsPublic BIT,
  CONSTRAINT pk_users_id PRIMARY KEY (Id), 
  CONSTRAINT fk_books_authorid FOREIGN KEY (AuthorId) REFERENCES tblUsers(Id),
  CONSTRAINT ck_books_id CHECK (Id REGEXP '[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}'),
  CONSTRAINT ck_books_id CHECK (AuthorId REGEXP '[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}')
);

-- DELIMITER //
-- 
-- ;
-- 
-- //
-- 
-- DELIMITER ;

-- Sample database

-- USERS
DROP PROCEDURE IF EXISTS sp_InsertSampleUsers;
CREATE PROCEDURE sp_InsertSampleUsers()
BEGIN
  INSERT INTO tblusers(Id, UserName, Password, Email, RegistrationDate, RetryAttempts, IsLocked, LockedDateTime, IsActivated) VALUES
    ('748cea8f-80be-11e5-87be-d43d7ef137da', 'Szymon', '+TxaMVKYX75MXYY0t20SXdNBU0UJOp1IF+3G8/+NPzpI5o4cKU6KBT3WcGijDMk9uYDO1rh3O75zGRY+NoLz43ggoHzZ6CA=', 'rvnlord@gmail.com', '2014-10-27 18:54:55', 0, 0, '2016-04-14 14:12:37', 1);
  INSERT INTO tblusers(Id, UserName, Password, Email, RegistrationDate, RetryAttempts, IsLocked, LockedDateTime, IsActivated) VALUES
    ('7698a976-e44b-43b9-a075-972c25b85a79', 'koverss', 'JUgJPkd6aEENlbbYPt0YVaU9zkqT3+HlBherT5FmCnZvk8tvVVwqPrvvG2fNQuSR9L5RFWzDzWpXnqs4fVXfgPAzVyHC', 'bbabczynski@gmail.com', '2016-04-04 01:22:10', 0, 0, '2016-04-04 01:22:10', 1);
  INSERT INTO tblusers(Id, UserName, Password, Email, RegistrationDate, RetryAttempts, IsLocked, LockedDateTime, IsActivated) VALUES
    ('a613ab1e-2e21-431a-a43e-1c0025c078ac', 'Test', 'LYPYblW2nFmH9KZ+xZfpdWm/jspQHLFo1bLEk77ODoYM3V9ILiVzR7wuxb5QTaWV8vs5wjuU1US8DOdOJ/14AQe2FW4=', 'r.vnlord@gmail.com', '2016-06-08 15:31:02', 0, 0, '2016-06-08 15:31:02', 1);
END;

TRUNCATE TABLE tblBooks;

-- BOOKS
DROP PROCEDURE IF EXISTS sp_InsertSampleBooks;
CREATE PROCEDURE sp_InsertSampleBooks()
BEGIN
  DELETE FROM tblBooks;
  INSERT INTO tblBooks (tblBooks.Id, tblBooks.Title, tblBooks.Category, tblBooks.Description, tblBooks.AuthorId, tblBooks.Path, tblBooks.AdditionDate, tblBooks.IsPublic)
    VALUES ("231f4f0c-80be-11e5-87be-d43d7ef137da", "Dzieñ Smoka", "Fantastyka", "ksi¹¿ka w œwiecie Warcrafta", "748cea8f-80be-11e5-87be-d43d7ef137da", "~/Data/Books/231f4f0c-80be-11e5-87be-d43d7ef137da", "2015-11-01 22:52:47", 1);
  INSERT INTO tblBooks (tblBooks.Id, tblBooks.Title, tblBooks.Category, tblBooks.Description, tblBooks.AuthorId, tblBooks.Path, tblBooks.AdditionDate, tblBooks.IsPublic)
    VALUES ("d91aabca-8314-11e5-91da-d43d7ef137da", "Noc Smoka", "Fantastyka", "Kolejna ksi¹¿ka w œwiecie Warcrafta", "748cea8f-80be-11e5-87be-d43d7ef137da", "~/Data/Books/d91aabca-8314-11e5-91da-d43d7ef137da", "2015-11-04 22:53:47", 1);
  INSERT INTO tblBooks (tblBooks.Id, tblBooks.Title, tblBooks.Category, tblBooks.Description, tblBooks.AuthorId, tblBooks.Path, tblBooks.AdditionDate, tblBooks.IsPublic)
    VALUES ("e039cc94-8315-11e5-91da-d43d7ef137da", "Ostatni Stra¿nik", "Fantastyka", "Jeszcze jedna ksi¹¿ka w œwiecie Warcrafta", "748cea8f-80be-11e5-87be-d43d7ef137da", "~/Data/Books/e039cc94-8315-11e5-91da-d43d7ef137da", "2015-11-04 22:54:47", 1);
  INSERT INTO tblBooks (tblBooks.Id, tblBooks.Title, tblBooks.Category, tblBooks.Description, tblBooks.AuthorId, tblBooks.Path, tblBooks.AdditionDate, tblBooks.IsPublic)
    VALUES ("bd4cff46-8316-11e5-91da-d43d7ef137da", "W³adca Klanów", "Fantastyka", "Jeszcze jedna ksi¹¿ka w œwiecie Warcrafta", "748cea8f-80be-11e5-87be-d43d7ef137da", "~/Data/Books/bd4cff46-8316-11e5-91da-d43d7ef137da", "2015-11-04 22:54:47", 1);
  INSERT INTO tblBooks (tblBooks.Id, tblBooks.Title, tblBooks.Category, tblBooks.Description, tblBooks.AuthorId, tblBooks.Path, tblBooks.AdditionDate, tblBooks.IsPublic)
    VALUES ("261f79ef-8317-11e5-91da-d43d7ef137da", "Studnia Wiecznoœci", "Fantastyka", "Jeszcze jedna ksi¹¿ka w œwiecie Warcrafta", "748cea8f-80be-11e5-87be-d43d7ef137da", "~/Data/Books/261f79ef-8317-11e5-91da-d43d7ef137da", "2015-11-04 22:54:47", 1);
  INSERT INTO tblBooks (tblBooks.Id, tblBooks.Title, tblBooks.Category, tblBooks.Description, tblBooks.AuthorId, tblBooks.Path, tblBooks.AdditionDate, tblBooks.IsPublic)
    VALUES ("1181f40d-a58e-11e5-be13-00ff23f4a6cf", "WiedŸmin: Dom ze Szk³a", "Fantastyka", "Historia Geralta, który podczas wêdrówki skrajem Czarnego Lasu, spotyka owdowia³ego myœliwego. Wspólnie wyruszaj¹ w dalsz¹ podró¿. Leœne œcie¿ki, a mo¿e i przeznaczenie prowadz¹ ich do tytu³owego domu ze szk³a, wielkiego i pe³nego tajemnic dworu, w którym mieszka zmar³a ¿ona Jakuba oraz wiele innych dziwnych mrocznych postaci.", "748cea8f-80be-11e5-87be-d43d7ef137da", "~/Data/Books/1181f40d-a58e-11e5-be13-00ff23f4a6cf", "2015-12-18 22:54:47", 1);
  INSERT INTO tblBooks (tblBooks.Id, tblBooks.Title, tblBooks.Category, tblBooks.Description, tblBooks.AuthorId, tblBooks.Path, tblBooks.AdditionDate, tblBooks.IsPublic)
    VALUES ("569a000d-a590-11e5-be13-00ff23f4a6cf", "WiedŸmin: Ostatnie ¯yczenie", "Fantastyka", "Pierwszy z cykli opowiadañ o Geralcie z Rivii.", "748cea8f-80be-11e5-87be-d43d7ef137da", "~/Data/Books/569a000d-a590-11e5-be13-00ff23f4a6cf", "2015-12-18 22:54:47", 1);
  INSERT INTO tblBooks (tblBooks.Id, tblBooks.Title, tblBooks.Category, tblBooks.Description, tblBooks.AuthorId, tblBooks.Path, tblBooks.AdditionDate, tblBooks.IsPublic)
    VALUES ("ae28a1ba-a590-11e5-be13-00ff23f4a6cf", "WiedŸmin: Miecz Przeznaczenia", "Fantastyka", "Drugi z cykli opowiadañ o Geralcie z Rivii.", "748cea8f-80be-11e5-87be-d43d7ef137da", "~/Data/Books/ae28a1ba-a590-11e5-be13-00ff23f4a6cf", "2015-12-18 22:54:47", 1);
  INSERT INTO tblBooks (tblBooks.Id, tblBooks.Title, tblBooks.Category, tblBooks.Description, tblBooks.AuthorId, tblBooks.Path, tblBooks.AdditionDate, tblBooks.IsPublic)
    VALUES ("2feb687b-a591-11e5-be13-00ff23f4a6cf", "WiedŸmin: Krew Elfów", "Fantastyka", "Pierwsza czêœæ sagi o Geralcie z Rivii.", "748cea8f-80be-11e5-87be-d43d7ef137da", "~/Data/Books/2feb687b-a591-11e5-be13-00ff23f4a6cf", "2015-12-18 22:54:47", 1);
  INSERT INTO tblBooks (tblBooks.Id, tblBooks.Title, tblBooks.Category, tblBooks.Description, tblBooks.AuthorId, tblBooks.Path, tblBooks.AdditionDate, tblBooks.IsPublic)
    VALUES ("b31d78ec-a591-11e5-be13-00ff23f4a6cf", "WiedŸmin: Czas Pogardy", "Fantastyka", "Druga czêœæ sagi o Geralcie z Rivii.", "748cea8f-80be-11e5-87be-d43d7ef137da", "~/Data/Books/b31d78ec-a591-11e5-be13-00ff23f4a6cf", "2015-12-18 22:54:47", 1);
  INSERT INTO tblBooks (tblBooks.Id, tblBooks.Title, tblBooks.Category, tblBooks.Description, tblBooks.AuthorId, tblBooks.Path, tblBooks.AdditionDate, tblBooks.IsPublic)
    VALUES ("5a914551-a592-11e5-be13-00ff23f4a6cf", "WiedŸmin: Chrzest Ognia", "Fantastyka", "Trzecia czêœæ sagi o Geralcie z Rivii.", "748cea8f-80be-11e5-87be-d43d7ef137da", "~/Data/Books/5a914551-a592-11e5-be13-00ff23f4a6cf", "2015-12-18 22:54:47", 1);
  INSERT INTO tblBooks (tblBooks.Id, tblBooks.Title, tblBooks.Category, tblBooks.Description, tblBooks.AuthorId, tblBooks.Path, tblBooks.AdditionDate, tblBooks.IsPublic)
    VALUES ("b3e378d6-a592-11e5-be13-00ff23f4a6cf", "WiedŸmin: Wie¿a Jaskó³ki", "Fantastyka", "Czwarta czêœæ sagi o Geralcie z Rivii.", "748cea8f-80be-11e5-87be-d43d7ef137da", "~/Data/Books/b3e378d6-a592-11e5-be13-00ff23f4a6cf", "2015-12-18 22:54:47", 1);
  INSERT INTO tblBooks (tblBooks.Id, tblBooks.Title, tblBooks.Category, tblBooks.Description, tblBooks.AuthorId, tblBooks.Path, tblBooks.AdditionDate, tblBooks.IsPublic)
    VALUES ("b351f7a2-a594-11e5-be13-00ff23f4a6cf", "WiedŸmin: Pani Jeziora", "Fantastyka", "Pi¹ta czêœæ sagi o Geralcie z Rivii.", "748cea8f-80be-11e5-87be-d43d7ef137da", "~/Data/Books/b351f7a2-a594-11e5-be13-00ff23f4a6cf", "2015-12-18 22:54:47", 1);
  INSERT INTO tblBooks (tblBooks.Id, tblBooks.Title, tblBooks.Category, tblBooks.Description, tblBooks.AuthorId, tblBooks.Path, tblBooks.AdditionDate, tblBooks.IsPublic)
    VALUES ("f3451066-a594-11e5-be13-00ff23f4a6cf", "WiedŸmin: Sezon Burz", "Fantastyka", "Geralt stacza walkê z niebezpiecznym potworem, którego jedynym celem w ¿yciu jest zabijanie ludzi. Krótko po tym zostaje aresztowany, co skutkuje utrat¹ jego dwóch bezcennych, kutych na miarê mieczy wiedŸmiñskich. Z ma³¹ pomoc¹ swojego przyjaciela, Jaskra i jego koneksji, robi wszystko, by odzyskaæ swoje narzêdzia pracy. W miêdzyczasie wdaje siê w romans z czarodziejk¹ Lytt¹ Neyd (o pseudonimie Koral), poznaje wp³ywowe persony oraz margines spo³eczny zwi¹zany z pañstwem, w którym utraci³ swoje miecze - Kerack. Te wydarzenia oraz nieukrywana i odwzajemniona niechêæ magów do Geralta (którzy okazuj¹ siê byæ powi¹zani z t¹ histori¹) sprawiaj¹, ¿e ca³oœæ uk³ada siê w pasmo niepowodzeñ, podczas których bohater zmuszony jest do podejmowania trudnych decyzji i naginania jedynego zbioru zasad, którymi powinien kierowaæ siê \"wzorowy\" wiedŸmin - Kodeksu.", "748cea8f-80be-11e5-87be-d43d7ef137da", "~/Data/Books/f3451066-a594-11e5-be13-00ff23f4a6cf", "2015-12-18 22:54:47", 1);
  INSERT INTO tblBooks (tblBooks.Id, tblBooks.Title, tblBooks.Category, tblBooks.Description, tblBooks.AuthorId, tblBooks.Path, tblBooks.AdditionDate, tblBooks.IsPublic)
    VALUES ("3b5771e2-d32a-11e5-b200-00ff23f4a6cf", "World of Warcraft: Kr¹g Nienawiœci", "Fantastyka", "P³on¹cy Legion zosta³ pokonany i wschodnie rejony Kalimdoru zamieszkuj¹ dwa narody orki z Durotaru pod wodz¹ szlachetnego Thralla i ludzie z Theramore, którymi rz¹dzi jeden z najpotê¿niejszych ¿yj¹cych magów, lady Jaina Proudmoore. ", "748cea8f-80be-11e5-87be-d43d7ef137da", "~/Data/Books/3b5771e2-d32a-11e5-b200-00ff23f4a6cf", "2016-02-14 15:57:47", 1);
  INSERT INTO tblBooks (tblBooks.Id, tblBooks.Title, tblBooks.Category, tblBooks.Description, tblBooks.AuthorId, tblBooks.Path, tblBooks.AdditionDate, tblBooks.IsPublic)
    VALUES ("7bcba4ed-f28c-11e5-9c77-00ff23f4a6cf", "Przyk³adowa Ksi¹¿ka", "Krymina³", "Przyk³adowa ksi¹¿ka 1", "748cea8f-80be-11e5-87be-d43d7ef137da", "~/Data/Books/7bcba4ed-f28c-11e5-9c77-00ff23f4a6cf", "2016-03-25 14:24:00", 1);
END;

CALL sp_InsertSampleBooks();

TRUNCATE TABLE tblBooks;

CALL sp_InsertSampleUsers();
CALL sp_InsertSampleBooks();

DELETE FROM tblBooks WHERE tblBooks.Id = UuidToBin("261f79ef-8317-11e5-91da-d43d7ef137da");

SELECT * FROM tblBooks b;

Select UUID();
SELECT NOW();

UPDATE tblBooks 
  SET tblBooks.IsPublic = 0 
  WHERE tblBooks.Id = UuidToBin("261f79ef-8317-11e5-91da-d43d7ef137da");

ALTER TABLE tblBooks CHANGE ThumbnailPath Thumbnail VARCHAR(257);
ALTER TABLE tblBooks CHANGE Thumbnail Path VARCHAR(257);

SET GLOBAL log_bin_trust_function_creators = 1;

GRANT ALL PRIVILEGES ON *.* TO b94e98e7639c53@'eu-cdbr-azure-north-d.cloudapp.net' IDENTIFIED BY 'cd2a7b7f';

-- Procedura do wyszukiwania ksi¹¿ek

DROP PROCEDURE IF EXISTS sp_SearchBooks;
CREATE PROCEDURE sp_SearchBooks(
  IN p_SearchTerms VARCHAR(1000), 
  IN p_IncludeTitle TINYINT, 
  IN p_IncludeAuthor TINYINT, 
  IN p_IncludeCategory TINYINT, 
  IN p_IncludeDescription TINYINT,
  IN p_HowMuchSkip INT,
  IN p_HowMuchTake INT,
  IN p_SortBy VARCHAR(100),
  IN p_SortOrder VARCHAR(100)
)
BEGIN
  DECLARE i INT DEFAULT 1;
  DECLARE v_currTerm VARCHAR(100) DEFAULT "";
  DECLARE v_totalResults INT DEFAULT 0;
  DECLARE v_resultsCount INT DEFAULT 0;
  DECLARE v_sortBy VARCHAR(100);

  DROP TEMPORARY TABLE IF EXISTS temp_tblSearchMatches;
	CREATE TEMPORARY TABLE temp_tblSearchMatches
  (
    Id VARCHAR(36),
    SearchTerm VARCHAR(100),
    CONSTRAINT ck_temp_searchmatches_id CHECK (Id REGEXP '[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}')
  );

  WHILE (SUBSTRING_INDEX(SUBSTRING_INDEX(CONCAT(p_SearchTerms, " end;"), ' ', i), ' ', -1) != "end;") DO
    SET v_currTerm = LOWER(SUBSTRING_INDEX(SUBSTRING_INDEX(CONCAT(p_SearchTerms, " end;"), ' ', i), ' ', -1));
    INSERT INTO temp_tblSearchMatches (temp_tblSearchMatches.Id, temp_tblSearchMatches.SearchTerm) 
      SELECT b.Id, v_currTerm FROM tblBooks b
        WHERE 
          LOWER(CONCAT(
            CASE p_IncludeTitle WHEN 1 THEN b.Title ELSE "" END, " ",
            CASE p_IncludeAuthor WHEN 1 THEN (SELECT u.UserName FROM tblUsers u WHERE u.ID = b.AuthorId) ELSE "" END, " ",
            CASE p_IncludeCategory WHEN 1 THEN b.Category ELSE "" END, " ",
            CASE p_IncludeDescription WHEN 1 THEN b.Description ELSE "" END)) LIKE CONCAT("%", v_currTerm, "%");
    SET i = i + 1;
  END WHILE;
  COMMIT;
  
  IF (LOWER(p_SortBy) = 'author') THEN
    SET v_SortBy = 'authorid';
  ELSE 
    SET v_SortBy = p_sortBy;
  END IF;

  DROP TEMPORARY TABLE IF EXISTS temp_tblSearchResults;
  SET @v_statement = CONCAT(
    'CREATE TEMPORARY TABLE temp_tblSearchResults AS ', 
      'SELECT b.Id, b.Title, b.Category, b.Description, b.AuthorId, b.Path, b.AdditionDate, b.IsPublic FROM tblBooks b ', 
        'WHERE b.Id IN ( ', 
          'SELECT sm.Id ',  
            'FROM temp_tblSearchMatches sm ', 
            'GROUP BY sm.Id ', 
            'HAVING COUNT(sm.SearchTerm) = ', i, ' - 1) ',  
        'ORDER BY ', v_SortBy, ' ', p_SortOrder, ' ', ';');
        -- 'LIMIT ', p_HowMuchTake, ' OFFSET ', p_HowMuchSkip, 
        
  PREPARE stmt FROM @v_statement;
  EXECUTE stmt;
  DEALLOCATE PREPARE stmt;
  
  SELECT COUNT(Id) INTO v_totalResults 
    FROM temp_tblSearchResults;
  
  SELECT COUNT(Id) INTO v_resultsCount
    FROM 
    (
      SELECT Id FROM temp_tblSearchResults
      LIMIT p_HowMuchTake OFFSET p_HowMuchSkip
    ) sr;

  SELECT CONCAT(
    p_HowMuchSkip, " - ", 
    CASE 
      WHEN ((p_HowMuchSkip + p_HowMuchTake) > v_totalResults) THEN v_totalResults 
      WHEN (v_resultsCount < p_HowMuchTake) THEN p_HowMuchSkip + v_resultsCount
      ELSE p_HowMuchSkip + p_HowMuchTake 
    END, " z ",
    v_totalResults, " (", 
    v_resultsCount, ")"
  ) AS ResultsCounter;

  SELECT * 
    FROM temp_tblSearchResults 
    LIMIT p_HowMuchTake OFFSET p_HowMuchSkip;
  
  DROP TEMPORARY TABLE IF EXISTS temp_tblSearchMatches;
  DROP TEMPORARY TABLE IF EXISTS temp_tblSearchResults;
END;


CREATE TABLE tblActivationRequests
(
	Id CHAR(36) PRIMARY KEY,
	UserId CHAR(36),
	ActivationRequestDateTime DATETIME,

  FOREIGN KEY (UserId) REFERENCES tblUsers(Id)
);

CREATE TABLE tblRemindPasswordRequests
(
	Id CHAR(36) PRIMARY KEY,
	UserId CHAR(36),
	RemindPasswordRequestDateTime DATETIME,

  FOREIGN KEY (UserId) REFERENCES tblUsers(Id)
);

CREATE TABLE tblKeys
(
  Id VARCHAR(30) PRIMARY KEY,
  Value VARCHAR(1500)
);

INSERT INTO tblKeys (tblKeys.Id, tblKeys.Value) VALUES ("email_private", "MIICdwIBADANBgkqhkiG9w0BAQEFAASCAmEwggJdAgEAAoGBALXOaXgwm2ZIszHDtw6DJojSxLlWgA4r2ewC+0VLkz1zr/gpU2COmbvntLhKbFE2MZQAoHm/AYV+0xOjzBInUv3uQJwK5caMLhaYBKJdWlRzxYhbMTMWThHIebN1iCbNCTK8MNlEQBX2Ila6hhluu3wgP0jx+8h7eKK2Hc5MwA8LAgMBAAECgYAbhk6Ndb5xM9x9UkYqmkyBNne2H5RvkNADXUgxa4m1KgigJ5GJ8szvl9rSc+IGQZAr+hRRmkterJ7EQG4q6W0050NhlmvlW3lNwkzbM23p9j9fpSDoHOlPzdMsrsbmZ+cOb8ruPxrnzfMj1zfQCpgSD1UDis2bNW3gs5U+Q9OmkQJBANn0sawCJ93b//vQ7rJo288GNwSA8tO48IJPX3E6x8E8qBiTIwM0PTeleCMyHwbaWlxvk8pDjJREIwItefhBwm0CQQDVimJaAA779yIGR+QqrqlnW4VxtsXCrL7WuvT3XFtpx/Cv3LeysmVj897JzeHiVEqzei4DT23T4LFo9jdNRWxXAkEAv+i1nFfVlILGtYo08oBjsritLtj/dq7rjkGnLwLrqdjnxaOge4y+rkWTL6JNMXKHh8Zy4fByUoZgMOWr9IyqTQJAPvyRpCBuSw4LYDTmbVyVpWIOi4sw7ApOREJjLW91m08ZhJYjLTeHxqLRbU8oOL1KR4RbfCh6qcuWKPKvP0CiAwJBAJA0VM4BFhiLrefKg+8Pvw6B+yGVd9TON4sVkeAVg8G4DPvLK7CcrD7hYNumpqeXklRl4Q4rPIGrP53wDF7Yxu4=");
INSERT INTO tblKeys (tblKeys.Id, tblKeys.Value) VALUES ("email_public", "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC1zml4MJtmSLMxw7cOgyaI0sS5VoAOK9nsAvtFS5M9c6/4KVNgjpm757S4SmxRNjGUAKB5vwGFftMTo8wSJ1L97kCcCuXGjC4WmASiXVpUc8WIWzEzFk4RyHmzdYgmzQkyvDDZREAV9iJWuoYZbrt8ID9I8fvIe3iith3OTMAPCwIDAQAB");

Update tblBooks 
  SET 
    tblBooks.Title = "Przyk³adowa Ksi¹¿ka", 
    tblBooks.Category = "Krymina³", 
    tblBooks.Description = "Przyk³adowa ksi¹¿ka 1", 
    tblBooks.AuthorId = "748cea8f-80be-11e5-87be-d43d7ef137da", 
    tblBooks.Path = "~/Data/Books/7bcba4ed-f28c-11e5-9c77-00ff23f4a6cf", 
    tblBooks.AdditionDate = "2016-03-25 14:24:00", 
    tblBooks.IsPublic = 1
  WHERE 
    tblBooks.Id = "7bcba4ed-f28c-11e5-9c77-00ff23f4a6cf";

UPDATE tblUsers u SET u.UserName = "Szymon" WHERE u.UserName = "rvnlord";

UPDATE tblKeys k SET k.Value = "MIICdwIBADANBgkqhkiG9w0BAQEFAASCAmEwggJdAgEAAoGBAMHyQkWwqP3zgc3YesQzLAPYo65o34/xw6ioN4puJ9ExZZtyA2ILV12Ms8sE6C7WLMQ6yjqOJ5asNV20Tdbzc+uw6A+WkdFBI1WB1XPoKG2zTj2CF+UOPmOrqZJ+9ETo8bjMbDOGD/XJ1bHLrBDzRx5LwsVpEMEdtyYWcYfBsiJNAgMBAAECgYAKHXJrZA1MQVjxvWqZtPmEsdXHkNyoCznjH/LVm20kMelUtBuND35c+Kuf2P+rAayQB2joqOVTrGOUIYU1wri26NW1yYgt/zncbBAgrPpqaP4oyCGRJ3DBqSmk5hbHuonZ2BZeVuzz3FyK/vHEEDOC1cSge7xxVMfM4Wn2m/td2QJBAO43BNepixL4xcZXw8VzFavTvsXQZdYn1xH7TPVGm7nwoW2YqSSOuUFY85BkvrudTXVL9mAe02ai14g2yaHjCJMCQQDQbSNecRKLpis5uiZkFk6i7Fs2VhSjpdIcgQdkjZ5MsfiEaLRgXAdB50utNze0xjMB8evrEQGL2oLkmRymLVWfAkAN/J0ELKhFzOWP58dO6Jr1I9Gnu7y+/kfafm7eV+780+wmizgjNV4bQCXM7J1mVq4dnQAyVJ0FAbq1/MGKB9KRAkEAoAAINMnMmNO5Pxl9uzu8pimXY8D1GyOChksu56wnp2zAALV4MrizAY6Tc6d95hJ4ubeDifKGI1xdOyum6JLItQJBAOYlBUEL1nuKAsH0QdIfUAFYJhzT/THdxMpzPJuKnSJYCCBXVty6hkXmvJxfcd9s1zO1PI6HEQY+DXXbI/NOrEk="
  WHERE k.Id = "email_private";
UPDATE tblKeys k SET k.Value = "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDB8kJFsKj984HN2HrEMywD2KOuaN+P8cOoqDeKbifRMWWbcgNiC1ddjLPLBOgu1izEOso6jieWrDVdtE3W83PrsOgPlpHRQSNVgdVz6Chts049ghflDj5jq6mSfvRE6PG4zGwzhg/1ydWxy6wQ80ceS8LFaRDBHbcmFnGHwbIiTQIDAQAB"
  WHERE k.Id = "email_public";

-- NOWE



-- ================================================================================================

SELECT * FROM tblBooks b WHERE b.Title LIKE 'Przyk%';

DELETE FROM tblBooks WHERE tblBooks.Category IS NULL;

DELETE FROM tblKeys;

CALL sp_SearchBooks("", 1, 0, 0, 1, 4, 12, 'title', 'asc');

CALL sp_SearchBooks("", 1, 0, 0, 1, 4, 12, 'title', 'asc', @p_ResultsCounter);
SELECT @p_ResultsCounter;

SELECT SUBSTRING_INDEX(SUBSTRING_INDEX("wyraz1 wyraz2 wyraz3 end;", ' ', 3), ' ', -1) AS v;

DELETE FROM tblActivationRequests;
DELETE FROM tblUsers WHERE LOWER(tblUsers.UserName) != 'rvnlord' && LOWER(tblUsers.UserName) != 'koverss';

SELECT * FROM tblActivationRequests ar;
SELECT * FROM tblremindpasswordrequests rp;
SELECT * FROM tblUsers;
SELECT * FROM tblBooks;
SELECT * FROM tblKeys k;

UPDATE tblUsers u SET u.IsActivated = 1;
UPDATE tblUsers u SET u.Email = "bbabczynski@gmail.com" WHERE u.UserName = "koverss";

UPDATE tblUsers u 
  SET u.Password = "O5g9a46GBK4pa1XIj9HI2u16Lr9pM7kbvs14O/76Jnpceb/EUUF0ln31rpXwUr3OEOaMa42XsAqyEoCKkS3eTfTkQBo=" 
  WHERE u.UserName = "rvnlord";

UPDATE tblUsers u 
  SET u.IsLocked = 0, u.RetryAttempts = 0, u.LockedDateTime = NULL
  WHERE u.UserName = "rvnlord";

UPDATE tblUsers u
  SET u.LockedDateTime = "2016-02-22 01:29:33"
  WHERE u.UserName = "rvnlord";

INSERT INTO tblactivationrequests (tblActivationRequests.Id, tblActivationRequests.UserId, tblActivationRequests.ActivationRequestDateTime)
  VALUES ("9d892b2b-9e15-4f0e-97a5-af4343d8b596", "016bcf98-e9cc-4a30-a538-b2e9ac371d9a", "2016-02-22 01:29:33");
INSERT INTO tblactivationrequests (tblActivationRequests.Id, tblActivationRequests.UserId, tblActivationRequests.ActivationRequestDateTime)
  VALUES ("9d892b2b-9e15-4f0e-97a5-af4343d8b596", "016bcf98-e9cc-4a30-a538-b2e9ac371d9a", CURDATE());

-- TEST

DROP PROCEDURE IF EXISTS sp_SearchTest;
CREATE PROCEDURE sp_SearchTest(
  IN p_SearchTerms VARCHAR(1000), 
  IN p_IncludeTitle TINYINT, 
  IN p_IncludeAuthor TINYINT, 
  IN p_IncludeCategory TINYINT, 
  IN p_IncludeDescription TINYINT,
  IN p_HowMuchSkip INT,
  IN p_HowMuchTake INT,
  IN p_SortBy VARCHAR(100),
  IN p_SortOrder VARCHAR(100)
)
BEGIN
  DECLARE i INT DEFAULT 1;
  DECLARE v_currTerm VARCHAR(100) DEFAULT "";
  DECLARE v_totalResults INT DEFAULT 0;
  DECLARE v_resultsCount INT DEFAULT 0;
  DECLARE v_sortBy VARCHAR(100);

  DROP TEMPORARY TABLE IF EXISTS temp_tblSearchMatches;
	CREATE TEMPORARY TABLE temp_tblSearchMatches
  (
    Id VARCHAR(36),
    SearchTerm VARCHAR(100),
    CONSTRAINT ck_temp_searchmatches_id CHECK (Id REGEXP '[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}')
  );

  WHILE (SUBSTRING_INDEX(SUBSTRING_INDEX(CONCAT(p_SearchTerms, " end;"), ' ', i), ' ', -1) != "end;") DO
    SET v_currTerm = LOWER(SUBSTRING_INDEX(SUBSTRING_INDEX(CONCAT(p_SearchTerms, " end;"), ' ', i), ' ', -1));
    INSERT INTO temp_tblSearchMatches (temp_tblSearchMatches.Id, temp_tblSearchMatches.SearchTerm) 
      SELECT b.Id, v_currTerm FROM tblBooks b
        WHERE 
          LOWER(CONCAT(
            CASE p_IncludeTitle WHEN 1 THEN b.Title ELSE "" END, " ",
            CASE p_IncludeAuthor WHEN 1 THEN (SELECT u.UserName FROM tblUsers u WHERE u.ID = b.AuthorId) ELSE "" END, " ",
            CASE p_IncludeCategory WHEN 1 THEN b.Category ELSE "" END, " ",
            CASE p_IncludeDescription WHEN 1 THEN b.Description ELSE "" END)) LIKE CONCAT("%", v_currTerm, "%");
    SET i = i + 1;
  END WHILE;
  COMMIT;

  SELECT * FROM temp_tblSearchMatches sm;

  DROP TEMPORARY TABLE IF EXISTS temp_tblSearchMatches;
END;

CALL sp_SearchTest("przy szy ksi¹", 1, 0, 0, 1, 4, 12, 'title', 'asc');




