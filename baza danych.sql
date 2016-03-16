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
  Thumbnail VARCHAR(255),
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
  INSERT INTO tblUsers (tblUsers.Id, tblUsers.UserName, tblUsers.Password, tblUsers.Email, tblUsers.RegistrationDate, tblUsers.RetryAttempts, tblUsers.IsLocked, tblUsers.LockedDateTime) 
    VALUES ("748cea8f-80be-11e5-87be-d43d7ef137da", "rvnlord", "lU80CJOjak3avac/ekz/6KsNmDP4emkviKRSl6uYobrZpQ2ACrycpFNOhmWLZiTUh5qqaUfb75GXn+J8GBVfNmBiM+s=", "rvnlord@gmail.com", "2014-10-27 18:54:55", 1, 0, null);
END;

TRUNCATE TABLE tblBooks;

-- BOOKS
DROP PROCEDURE IF EXISTS sp_InsertSampleBooks;
CREATE PROCEDURE sp_InsertSampleBooks()
BEGIN
  INSERT INTO tblBooks (tblBooks.Id, tblBooks.Title, tblBooks.Category, tblBooks.Description, tblBooks.AuthorId, tblBooks.Thumbnail, tblBooks.AdditionDate, tblBooks.IsPublic)
    VALUES ("231f4f0c-80be-11e5-87be-d43d7ef137da", "Dzieñ Smoka", "Fantastyka", "ksi¹¿ka w œwiecie Warcrafta", "748cea8f-80be-11e5-87be-d43d7ef137da", "~/Data/Books/231f4f0c-80be-11e5-87be-d43d7ef137da/Cover.jpg", "2015-11-01 22:52:47", 1);
  INSERT INTO tblBooks (tblBooks.Id, tblBooks.Title, tblBooks.Category, tblBooks.Description, tblBooks.AuthorId, tblBooks.Thumbnail, tblBooks.AdditionDate, tblBooks.IsPublic)
    VALUES ("d91aabca-8314-11e5-91da-d43d7ef137da", "Noc Smoka", "Fantastyka", "Kolejna ksi¹¿ka w œwiecie Warcrafta", "748cea8f-80be-11e5-87be-d43d7ef137da", "~/Data/Books/d91aabca-8314-11e5-91da-d43d7ef137da/Cover.jpg", "2015-11-04 22:53:47", 1);
  INSERT INTO tblBooks (tblBooks.Id, tblBooks.Title, tblBooks.Category, tblBooks.Description, tblBooks.AuthorId, tblBooks.Thumbnail, tblBooks.AdditionDate, tblBooks.IsPublic)
    VALUES ("e039cc94-8315-11e5-91da-d43d7ef137da", "Ostatni Stra¿nik", "Fantastyka", "Jeszcze jedna ksi¹¿ka w œwiecie Warcrafta", "748cea8f-80be-11e5-87be-d43d7ef137da", "~/Data/Books/e039cc94-8315-11e5-91da-d43d7ef137da/Cover.jpg", "2015-11-04 22:54:47", 1);
  INSERT INTO tblBooks (tblBooks.Id, tblBooks.Title, tblBooks.Category, tblBooks.Description, tblBooks.AuthorId, tblBooks.Thumbnail, tblBooks.AdditionDate, tblBooks.IsPublic)
    VALUES ("bd4cff46-8316-11e5-91da-d43d7ef137da", "W³adca Klanów", "Fantastyka", "Jeszcze jedna ksi¹¿ka w œwiecie Warcrafta", "748cea8f-80be-11e5-87be-d43d7ef137da", "~/Data/Books/bd4cff46-8316-11e5-91da-d43d7ef137da/Cover.jpg", "2015-11-04 22:54:47", 1);
  INSERT INTO tblBooks (tblBooks.Id, tblBooks.Title, tblBooks.Category, tblBooks.Description, tblBooks.AuthorId, tblBooks.Thumbnail, tblBooks.AdditionDate, tblBooks.IsPublic)
    VALUES ("261f79ef-8317-11e5-91da-d43d7ef137da", "Studnia Wiecznoœci", "Fantastyka", "Jeszcze jedna ksi¹¿ka w œwiecie Warcrafta", "748cea8f-80be-11e5-87be-d43d7ef137da", "~/Data/Books/261f79ef-8317-11e5-91da-d43d7ef137da/Cover.jpg", "2015-11-04 22:54:47", 1);
  INSERT INTO tblBooks (tblBooks.Id, tblBooks.Title, tblBooks.Category, tblBooks.Description, tblBooks.AuthorId, tblBooks.Thumbnail, tblBooks.AdditionDate, tblBooks.IsPublic)
    VALUES ("1181f40d-a58e-11e5-be13-00ff23f4a6cf", "WiedŸmin: Dom ze Szk³a", "Fantastyka", "Historia Geralta, który podczas wêdrówki skrajem Czarnego Lasu, spotyka owdowia³ego myœliwego. Wspólnie wyruszaj¹ w dalsz¹ podró¿. Leœne œcie¿ki, a mo¿e i przeznaczenie prowadz¹ ich do tytu³owego domu ze szk³a, wielkiego i pe³nego tajemnic dworu, w którym mieszka zmar³a ¿ona Jakuba oraz wiele innych dziwnych mrocznych postaci.", "748cea8f-80be-11e5-87be-d43d7ef137da", "~/Data/Books/1181f40d-a58e-11e5-be13-00ff23f4a6cf/Cover.jpg", "2015-12-18 22:54:47", 1);
  INSERT INTO tblBooks (tblBooks.Id, tblBooks.Title, tblBooks.Category, tblBooks.Description, tblBooks.AuthorId, tblBooks.Thumbnail, tblBooks.AdditionDate, tblBooks.IsPublic)
    VALUES ("569a000d-a590-11e5-be13-00ff23f4a6cf", "WiedŸmin: Ostatnie ¯yczenie", "Fantastyka", "Pierwszy z cykli opowiadañ o Geralcie z Rivii.", "748cea8f-80be-11e5-87be-d43d7ef137da", "~/Data/Books/569a000d-a590-11e5-be13-00ff23f4a6cf/Cover.jpg", "2015-12-18 22:54:47", 1);
  INSERT INTO tblBooks (tblBooks.Id, tblBooks.Title, tblBooks.Category, tblBooks.Description, tblBooks.AuthorId, tblBooks.Thumbnail, tblBooks.AdditionDate, tblBooks.IsPublic)
    VALUES ("ae28a1ba-a590-11e5-be13-00ff23f4a6cf", "WiedŸmin: Miecz Przeznaczenia", "Fantastyka", "Drugi z cykli opowiadañ o Geralcie z Rivii.", "748cea8f-80be-11e5-87be-d43d7ef137da", "~/Data/Books/ae28a1ba-a590-11e5-be13-00ff23f4a6cf/Cover.jpg", "2015-12-18 22:54:47", 1);
  INSERT INTO tblBooks (tblBooks.Id, tblBooks.Title, tblBooks.Category, tblBooks.Description, tblBooks.AuthorId, tblBooks.Thumbnail, tblBooks.AdditionDate, tblBooks.IsPublic)
    VALUES ("2feb687b-a591-11e5-be13-00ff23f4a6cf", "WiedŸmin: Krew Elfów", "Fantastyka", "Pierwsza czêœæ sagi o Geralcie z Rivii.", "748cea8f-80be-11e5-87be-d43d7ef137da", "~/Data/Books/2feb687b-a591-11e5-be13-00ff23f4a6cf/Cover.jpg", "2015-12-18 22:54:47", 1);
  INSERT INTO tblBooks (tblBooks.Id, tblBooks.Title, tblBooks.Category, tblBooks.Description, tblBooks.AuthorId, tblBooks.Thumbnail, tblBooks.AdditionDate, tblBooks.IsPublic)
    VALUES ("b31d78ec-a591-11e5-be13-00ff23f4a6cf", "WiedŸmin: Czas Pogardy", "Fantastyka", "Druga czêœæ sagi o Geralcie z Rivii.", "748cea8f-80be-11e5-87be-d43d7ef137da", "~/Data/Books/b31d78ec-a591-11e5-be13-00ff23f4a6cf/Cover.jpg", "2015-12-18 22:54:47", 1);
  INSERT INTO tblBooks (tblBooks.Id, tblBooks.Title, tblBooks.Category, tblBooks.Description, tblBooks.AuthorId, tblBooks.Thumbnail, tblBooks.AdditionDate, tblBooks.IsPublic)
    VALUES ("5a914551-a592-11e5-be13-00ff23f4a6cf", "WiedŸmin: Chrzest Ognia", "Fantastyka", "Trzecia czêœæ sagi o Geralcie z Rivii.", "748cea8f-80be-11e5-87be-d43d7ef137da", "~/Data/Books/5a914551-a592-11e5-be13-00ff23f4a6cf/Cover.jpg", "2015-12-18 22:54:47", 1);
  INSERT INTO tblBooks (tblBooks.Id, tblBooks.Title, tblBooks.Category, tblBooks.Description, tblBooks.AuthorId, tblBooks.Thumbnail, tblBooks.AdditionDate, tblBooks.IsPublic)
    VALUES ("b3e378d6-a592-11e5-be13-00ff23f4a6cf", "WiedŸmin: Wie¿a Jaskó³ki", "Fantastyka", "Czwarta czêœæ sagi o Geralcie z Rivii.", "748cea8f-80be-11e5-87be-d43d7ef137da", "~/Data/Books/b3e378d6-a592-11e5-be13-00ff23f4a6cf/Cover.jpg", "2015-12-18 22:54:47", 1);
  INSERT INTO tblBooks (tblBooks.Id, tblBooks.Title, tblBooks.Category, tblBooks.Description, tblBooks.AuthorId, tblBooks.Thumbnail, tblBooks.AdditionDate, tblBooks.IsPublic)
    VALUES ("b351f7a2-a594-11e5-be13-00ff23f4a6cf", "WiedŸmin: Pani Jeziora", "Fantastyka", "Pi¹ta czêœæ sagi o Geralcie z Rivii.", "748cea8f-80be-11e5-87be-d43d7ef137da", "~/Data/Books/b351f7a2-a594-11e5-be13-00ff23f4a6cf/Cover.jpg", "2015-12-18 22:54:47", 1);
  INSERT INTO tblBooks (tblBooks.Id, tblBooks.Title, tblBooks.Category, tblBooks.Description, tblBooks.AuthorId, tblBooks.Thumbnail, tblBooks.AdditionDate, tblBooks.IsPublic)
    VALUES ("f3451066-a594-11e5-be13-00ff23f4a6cf", "WiedŸmin: Sezon Burz", "Fantastyka", "Geralt stacza walkê z niebezpiecznym potworem, którego jedynym celem w ¿yciu jest zabijanie ludzi. Krótko po tym zostaje aresztowany, co skutkuje utrat¹ jego dwóch bezcennych, kutych na miarê mieczy wiedŸmiñskich. Z ma³¹ pomoc¹ swojego przyjaciela, Jaskra i jego koneksji, robi wszystko, by odzyskaæ swoje narzêdzia pracy. W miêdzyczasie wdaje siê w romans z czarodziejk¹ Lytt¹ Neyd (o pseudonimie Koral), poznaje wp³ywowe persony oraz margines spo³eczny zwi¹zany z pañstwem, w którym utraci³ swoje miecze - Kerack. Te wydarzenia oraz nieukrywana i odwzajemniona niechêæ magów do Geralta (którzy okazuj¹ siê byæ powi¹zani z t¹ histori¹) sprawiaj¹, ¿e ca³oœæ uk³ada siê w pasmo niepowodzeñ, podczas których bohater zmuszony jest do podejmowania trudnych decyzji i naginania jedynego zbioru zasad, którymi powinien kierowaæ siê \"wzorowy\" wiedŸmin - Kodeksu.", "748cea8f-80be-11e5-87be-d43d7ef137da", "~/Data/Books/f3451066-a594-11e5-be13-00ff23f4a6cf/Cover.jpg", "2015-12-18 22:54:47", 1);
  INSERT INTO tblBooks (tblBooks.Id, tblBooks.Title, tblBooks.Category, tblBooks.Description, tblBooks.AuthorId, tblBooks.Thumbnail, tblBooks.AdditionDate, tblBooks.IsPublic)
    VALUES ("3b5771e2-d32a-11e5-b200-00ff23f4a6cf", "World of Warcraft: Kr¹g Nienawiœci", "Fantastyka", "P³on¹cy Legion zosta³ pokonany i wschodnie rejony Kalimdoru zamieszkuj¹ dwa narody orki z Durotaru pod wodz¹ szlachetnego Thralla i ludzie z Theramore, którymi rz¹dzi jeden z najpotê¿niejszych ¿yj¹cych magów, lady Jaina Proudmoore. ", "748cea8f-80be-11e5-87be-d43d7ef137da", "~/Data/Books/3b5771e2-d32a-11e5-b200-00ff23f4a6cf/Cover.jpg", "2016-02-14 15:57:47", 1);
END;

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
      'SELECT b.Id, b.Title, b.Category, b.Description, b.AuthorId, b.Thumbnail, b.AdditionDate, b.IsPublic FROM tblBooks b ', 
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

-- ================================================================================================

CALL sp_SearchBooks("", 1, 0, 0, 1, 4, 12, 'title', 'asc');

CALL sp_SearchBooks("", 1, 0, 0, 1, 4, 12, 'title', 'asc', @p_ResultsCounter);
SELECT @p_ResultsCounter;

SELECT SUBSTRING_INDEX(SUBSTRING_INDEX("wyraz1 wyraz2 wyraz3 end;", ' ', 3), ' ', -1) AS v;

DELETE FROM tblActivationRequests;
DELETE FROM tblUsers WHERE LOWER(tblUsers.UserName) != 'rvnlord';

SELECT * FROM tblActivationRequests ar;
SELECT * FROM tblremindpasswordrequests rp;
SELECT * FROM tblUsers;
SELECT * FROM tblBooks;

UPDATE tblUsers u SET u.IsActivated = 1;

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




