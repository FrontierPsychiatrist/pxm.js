-- Create a test database.
--
BEGIN;
DROP SCHEMA IF EXISTS pxm;
CREATE DATABASE pxm;

USE pxm;

-- TODO: deletion candidate?
CREATE TABLE `pxm_badword` (
  `bw_name` char(20) NOT NULL default '',
  `bw_replacement` char(20) NOT NULL default '',
  PRIMARY KEY  (`bw_name`)
);

INSERT INTO `pxm_badword` (`bw_name`, `bw_replacement`)
VALUES ('fuck', '****'),
('shit', '$#!7'),
('Gamepro', 'G******');

# --------------------------------------------------------

-- TODO: deletion candidate?
CREATE TABLE `pxm_banner` (
  `ba_id` int(10) unsigned NOT NULL auto_increment,
  `ba_boardid` int(11) NOT NULL default '0',
  `ba_code` mediumtext NOT NULL,
  `ba_start` int(10) unsigned NOT NULL default '0',
  `ba_expiration` int(10) unsigned NOT NULL default '0',
  `ba_views` mediumint(8) unsigned NOT NULL default '0',
  `ba_maxviews` mediumint(8) unsigned NOT NULL default '0',
  PRIMARY KEY  (`ba_id`),
  KEY `ba_boardid` (`ba_boardid`)
);

INSERT INTO `pxm_banner` (`ba_id`, `ba_boardid`, `ba_code`, `ba_start`, `ba_expiration`, `ba_views`, `ba_maxviews`) VALUES (6, 0, '<img src="images/banner.jpg">', 1032213600, 0, 0, 0);
# --------------------------------------------------------

CREATE TABLE `pxm_board` (
  `b_id` int(10) unsigned NOT NULL auto_increment,
  `b_name` varchar(100) NOT NULL default '',
  `b_description` varchar(255) NOT NULL default '',
  `b_position` int(10) unsigned NOT NULL default '0',
  `b_active` tinyint(3) unsigned NOT NULL default '0',
  `b_lastmsgtstmp` int(10) unsigned NOT NULL default '0',
  `b_skinid` smallint(5) unsigned NOT NULL default '1',
  `b_timespan` smallint(5) unsigned NOT NULL default '100',
  `b_threadlistsort` varchar(20) NOT NULL default '',
  `b_parsestyle` tinyint(3) unsigned NOT NULL default '0',
  `b_parseurl` tinyint(3) unsigned NOT NULL default '0',
  `b_parseimg` tinyint(3) unsigned NOT NULL default '0',
  `b_replacetext` tinyint(3) unsigned NOT NULL default '0',
  PRIMARY KEY  (`b_id`)
);

INSERT INTO pxm_board (b_name, b_description)
	VALUES('Test', 'Entwicklung')
;

# --------------------------------------------------------

CREATE TABLE `pxm_configuration` (
  `c_id` int(10) unsigned NOT NULL auto_increment,
  `c_banner` tinyint(3) unsigned NOT NULL default '0',
  `c_quickpost` tinyint(3) unsigned NOT NULL default '0',
  `c_guestpost` tinyint(3) unsigned NOT NULL default '0',
  `c_directregistration` tinyint(3) unsigned NOT NULL default '0',
  `c_uniquemail` tinyint(3) unsigned NOT NULL default '0',
  `c_countviews` tinyint(3) unsigned NOT NULL default '0',
  `c_dateformat` varchar(30) NOT NULL default '',
  `c_timeoffset` tinyint(3) unsigned NOT NULL default '0',
  `c_onlinetime` smallint(5) unsigned NOT NULL default '0',
  `c_closethreads` smallint(5) unsigned NOT NULL default '0',
  `c_usrperpage` mediumint(8) unsigned NOT NULL default '0',
  `c_msgperpage` mediumint(8) unsigned NOT NULL default '0',
  `c_msgheaderperpage` mediumint(8) unsigned NOT NULL default '0',
  `c_privatemsgperpage` mediumint(8) unsigned NOT NULL default '0',
  `c_thrdperpage` mediumint(8) unsigned NOT NULL default '0',
  `c_mailwebmaster` varchar(100) NOT NULL default '',
  `c_maxprofilepicsize` mediumint(8) unsigned NOT NULL default '0',
  `c_maxprofilepicwidth` smallint(5) unsigned NOT NULL default '0',
  `c_maxprofilepicheight` smallint(5) unsigned NOT NULL default '0',
  `c_profileimgdir` varchar(100) NOT NULL default '',
  `c_usesignatures` tinyint(3) unsigned NOT NULL default '0',
  `c_skinid` smallint(5) unsigned NOT NULL default '0',
  `c_quotechar` char(1) NOT NULL default '>',
  `c_quotesubject` varchar(10) NOT NULL default 'Re:',
  `c_skindir` varchar(100) NOT NULL default '',
  `c_parseurl` tinyint(3) unsigned NOT NULL default '0',
  `c_parsestyle` tinyint(3) unsigned NOT NULL default '0',
  PRIMARY KEY  (`c_id`)
);

INSERT INTO `pxm_configuration` (`c_id`, `c_banner`, `c_quickpost`, `c_guestpost`, `c_directregistration`, `c_uniquemail`, `c_countviews`, `c_dateformat`, `c_timeoffset`, `c_onlinetime`, `c_closethreads`, `c_usrperpage`, `c_msgperpage`, `c_msgheaderperpage`, `c_privatemsgperpage`, `c_thrdperpage`, `c_mailwebmaster`, `c_maxprofilepicsize`, `c_maxprofilepicwidth`, `c_maxprofilepicheight`, `c_profileimgdir`, `c_usesignatures`, `c_skinid`, `c_quotechar`, `c_quotesubject`, `c_skindir`, `c_parseurl`, `c_parsestyle`) VALUES (1, 1, 1, 1, 1, 1, 1, 'j.m.Y H:i', 0, 300, 0, 10, 10, 50, 10, 20, '', 50000, 200, 250, 'images/profile/', 1, 2, '>', 'Re:', 'skins/', 1, 1);
# --------------------------------------------------------

CREATE TABLE `pxm_error` (
  `e_id` mediumint(8) unsigned NOT NULL default '0',
  `e_message` varchar(255) NOT NULL default '',
  PRIMARY KEY  (`e_id`)
);

-- TODO: UTF-8
INSERT INTO `pxm_error` (`e_id`, `e_message`) VALUES (1, 'ungültiger modus'),
(2, 'nickname unbekannt'),
(3, 'passwort ungÃ¼ltig'),
(4, 'konnte session nicht anlegen'),
(5, 'board id fehlt'),
(6, 'message id ungÃ¼ltig'),
(7, 'subject fehlt'),
(8, 'konnte daten nicht einfÃ¼gen'),
(9, 'dieser thread ist geschlossen'),
(10, 'thread id ungÃ¼ltig'),
(11, 'sie sind bereits eingeloggt'),
(12, 'sie sind nicht dazu berechtigt'),
(13, 'konnte daten nicht lÃ¶schen'),
(14, 'diese nachricht ist bereits vorhanden'),
(15, 'fehler beim upload des bildes'),
(16, 'konnte email nicht verschicken'),
(17, 'auf diese nachricht wurde bereits geantwortet'),
(18, 'dieses board ist geschlossen'),
(19, 'ergebnismenge zu groÃŸ bitte schrÃ¤nken sie die suche ein'),
(20, 'user id ungÃ¼ltig'),
(21, 'email ungÃ¼ltig'),
(22, 'sie sind nicht angemeldet'),
(23, 'konnte passwort nicht Ã¼bernehmen'),
(24, 'ihre daten stimmen nicht mit den gespeicherten Ã¼berein'),
(25, 'dieser nickname ist bereits vergeben'),
(26, 'bitte geben sie ihren nickname ein');
# --------------------------------------------------------

CREATE TABLE `pxm_forbiddenmail` (
  `fm_adress` char(100) NOT NULL default '',
  PRIMARY KEY  (`fm_adress`)
);

INSERT INTO pxm_forbiddenmail (fm_adress) VALUES ('test@example.com');

# --------------------------------------------------------

-- TODO: normalise, remove IP
CREATE TABLE `pxm_message` (
  `m_id` int(10) unsigned NOT NULL auto_increment,
  `m_threadid` int(10) unsigned NOT NULL default '0',
  `m_parentid` int(10) unsigned NOT NULL default '0',
  `m_userid` int(10) unsigned NOT NULL default '0',
  `m_usernickname` varchar(30) NOT NULL default '',
  `m_usermail` varchar(100) NOT NULL default '',
  `m_userhighlight` tinyint(3) unsigned NOT NULL default '0',
  `m_subject` varchar(100) NOT NULL default '',
  `m_body` mediumtext NOT NULL,
  `m_tstmp` int(10) unsigned NOT NULL default '0',
  `m_ip` varchar(50) NOT NULL default '',
  `m_notification` tinyint(3) unsigned NOT NULL default '0',
  PRIMARY KEY  (`m_id`),
  KEY `m_tstmp` (`m_tstmp`),
  KEY `m_thread` (`m_threadid`,`m_tstmp`),
  KEY `m_thread_parent` (`m_threadid`,`m_parentid`),
  KEY `m_usernickname` (`m_usernickname`,`m_tstmp`)
);

-- CREATE FULLTEXT INDEX m_search ON pxm_message(m_subject, m_body);

INSERT INTO pxm_message (m_usernickname, m_body)
	VALUES("Test", "Dies ist eine Nachricht.")
;

# --------------------------------------------------------

CREATE TABLE `pxm_moderator` (
  `mod_userid` int(10) unsigned NOT NULL default '0',
  `mod_boardid` int(10) unsigned NOT NULL default '0',
  PRIMARY KEY  (`mod_userid`,`mod_boardid`),
  KEY `mod_boardid` (`mod_boardid`)
);
# --------------------------------------------------------

-- TODO: UTF-8
CREATE TABLE `pxm_notification` (
  `n_id` mediumint(8) unsigned NOT NULL auto_increment,
  `n_message` text NOT NULL,
  `n_name` varchar(50) NOT NULL default '',
  `n_description` varchar(255) NOT NULL default '',
  PRIMARY KEY  (`n_id`)
);

INSERT INTO `pxm_notification` (`n_id`, `n_message`, `n_name`, `n_description`) VALUES (1, 'PXMBoard Registrierung', 'registration mail subject', 'subject of the registration mail'),
(2, 'Sie wurden registriert.\nIhr Nickname lautet: %nickname%\nIhr Passwort lautet: %password%', 'registration mail body', 'body of the registration mail\navailable placeholders: %password%,%nickname%'),
(3, 'PXMBoard Registrierung', 'registration declined mail subject', 'subject of the registration declined mail'),
(4, 'Sie wurden nich registriert.\nGrund: %reason%', 'registration declined mail body', 'body of the registration declined mail\navailable placeholders: %nickname%,%reason%'),
(5, 'Doppelanmeldungen sind unzulÃ¤ssig!', 'registration declined reason', 'default reason for a declined registration'),
(6, 'Anforderung eines neuen Passwortes', 'password request mail subject', 'subject of the password request mail'),
(7, 'Rufen sie folgenden Link auf wenn sie ein neues Passwort benÃ¶tigen http://localhost/pxmboard/pxmboard.php?mode=usersendpwd&key=%key%', 'password request mail body', 'body of the password request mail\navailable placeholders: %nickname%, %key%'),
(8, 'PXMBoard', 'lost password mail subject', 'subject of the lost password mail'),
(9, 'Ihr Passwort lautet %password%', 'lost password mail body', 'body of the lost password mail\navailable placeholders: %nickname%, %password%'),
(10, 'Wurde editiert', 'edit note', 'edit note for messages\navailable placeholders: %nickname%, %date%'),
(11, 'PXMBoard private Nachricht', 'private message mail subject', 'subject of the new private message notification'),
(12, 'Sie habe eine neue private Nachricht erhalten', 'private message mail body', 'body of the new private message notification\navailable placeholders: %nickname%'),
(13, 'PXMBoard neue Antwort', 'reply notification mail subject', 'subject of the reply notification'),
(14, 'Der Nutzer %nickname% hat auf ihren Beitrag %subject% geantwortet.\npxmboard.php?mode=board&brdid=%boardid%&thrdid=%threadid%&msgid=%replyid%', 'reply notification mail body', 'body of the reply notification\navailable placeholders: %nickname%,%subject%,%id%,%replysubject%,%replyid%,%boardid%,%threadid%');
# --------------------------------------------------------

-- TODO: remove IP
CREATE TABLE `pxm_priv_message` (
  `p_id` int(10) unsigned NOT NULL auto_increment,
  `p_touserid` int(10) unsigned NOT NULL default '0',
  `p_fromuserid` int(10) unsigned NOT NULL default '0',
  `p_subject` varchar(100) NOT NULL default '',
  `p_body` mediumtext NOT NULL,
  `p_tstmp` int(10) unsigned NOT NULL default '0',
  `p_ip` varchar(50) NOT NULL default '',
  `p_tostate` tinyint(3) unsigned NOT NULL default '1',
  `p_fromstate` tinyint(3) unsigned NOT NULL default '2',
  PRIMARY KEY  (`p_id`),
  KEY `p_tstmp` (`p_tstmp`),
  KEY `p_inbox` ( `p_fromuserid` , `p_touserid` , `p_tostate` , `p_tstmp` ),
  KEY `p_outbox` ( `p_touserid` , `p_fromuserid` , `p_fromstate` , `p_tstmp` )
);
# --------------------------------------------------------

CREATE TABLE `pxm_profile_accept` (
  `pa_name` char(15) NOT NULL default '',
  `pa_type` enum('s','a','i') NOT NULL default 's',
  `pa_length` smallint(5) unsigned NOT NULL default '0',
  PRIMARY KEY  (`pa_name`)
);

INSERT INTO `pxm_profile_accept` (`pa_name`, `pa_type`, `pa_length`) VALUES ('icq', 'i', 0),
('url', 's', 100),
('hobby', 's', 100);
# --------------------------------------------------------

CREATE TABLE `pxm_search` (
`se_id` INT UNSIGNED NOT NULL AUTO_INCREMENT ,
`se_userid` INT UNSIGNED NOT NULL ,
`se_message` VARCHAR( 255 ) NOT NULL ,
`se_nickname` VARCHAR( 30 ) NOT NULL ,
`se_days` INT UNSIGNED NOT NULL ,
`se_boardids` VARCHAR( 255 ) NOT NULL ,
`se_tstmp` INT UNSIGNED NOT NULL ,
PRIMARY KEY ( `se_id` ) ,
INDEX ( `se_tstmp` )
);
# --------------------------------------------------------

CREATE TABLE `pxm_skin` (
  `s_id` int(10) unsigned NOT NULL default '0',
  `s_fieldname` varchar(15) NOT NULL default '',
  `s_fieldvalue` varchar(255) NOT NULL default '',
  PRIMARY KEY  (`s_id`,`s_fieldname`)
);

INSERT INTO `pxm_skin` (`s_id`, `s_fieldname`, `s_fieldvalue`) VALUES
(1, 'name', 'PXM Xsl Template'),
(1, 'dir', 'pxm'),
(1, 'type', 'Xslt'),
(1, 'frame_top', '40'),
(1, 'frame_bottom', '40'),
(1, 'quoteprefix', '<font color="#808080">'),
(1, 'quotesuffix', '</font>'),
(1, 'tgfx_lastc', '<img src="images/lc.gif" width="8" height="22" border="0"/>'),
(1, 'tgfx_midc', '<img src="images/mc.gif" width="8" height="22" border="0"/>'),
(1, 'tgfx_empty', '<img src="images/empty.gif" width="8" height="22" border="0"/>'),
(1, 'tgfx_noc', '<img src="images/nc.gif" width="8" height="22" border="0"/>'),
(2, 'name', 'PXM Smarty Template'),
(2, 'dir', 'smarty'),
(2, 'type', 'Smarty'),
(2, 'frame_top', '40'),
(2, 'frame_bottom', '40'),
(2, 'quoteprefix', '<font color="#808080">'),
(2, 'quotesuffix', '</font>'),
(2, 'tgfx_lastc', '<img src="images/lc.gif" width="8" height="22" border="0"/>'),
(2, 'tgfx_midc', '<img src="images/mc.gif" width="8" height="22" border="0"/>'),
(2, 'tgfx_noc', '<img src="images/nc.gif" width="8" height="22" border="0"/>'),
(2, 'tgfx_empty', '<img src="images/empty.gif" width="8" height="22" border="0"/>');
# --------------------------------------------------------

CREATE TABLE `pxm_textreplacement` (
  `tr_name` char(20) NOT NULL default '',
  `tr_replacement` char(255) NOT NULL default '',
  PRIMARY KEY  (`tr_name`)
);

INSERT INTO `pxm_textreplacement` (`tr_name`, `tr_replacement`) VALUES (':-)', '<img src="images/smiley.gif"/>');
# --------------------------------------------------------

CREATE TABLE `pxm_thread` (
  `t_id` int(10) unsigned NOT NULL auto_increment,
  `t_boardid` int(10) unsigned NOT NULL default '0',
  `t_active` tinyint(3) unsigned NOT NULL default '0',
  `t_fixed` tinyint(3) unsigned NOT NULL default '0',
  `t_lastmsgtstmp` int(10) unsigned NOT NULL default '0',
  `t_lastmsgid` int(10) unsigned NOT NULL default '0',
  `t_msgquantity` int(10) unsigned NOT NULL default '0',
  `t_views` int(10) unsigned NOT NULL default '0',
  PRIMARY KEY  (`t_id`),
  KEY `threadlist_lastmsgtstmp` ( `t_boardid` , `t_fixed` , `t_lastmsgtstmp` ),
  KEY `t_lastmsgtstmp` (`t_lastmsgtstmp`)
);
# --------------------------------------------------------

CREATE TABLE `pxm_user` (
  `u_id` int(10) unsigned NOT NULL auto_increment,
  `u_nickname` varchar(30) NOT NULL default '',
  `u_password` varchar(32) NOT NULL default '',
  `u_passwordkey` varchar(32) NOT NULL default '',
  `u_ticket` varchar(32) NOT NULL default '',
  `u_firstname` varchar(30) NOT NULL default '',
  `u_lastname` varchar(30) NOT NULL default '',
  `u_city` varchar(30) NOT NULL default '',
  `u_publicmail` varchar(100) NOT NULL default '',
  `u_privatemail` varchar(100) NOT NULL default '',
  `u_registrationmail` varchar(100) NOT NULL default '',
  `u_registrationtstmp` int(10) unsigned NOT NULL default '0',
  `u_msgquantity` int(10) unsigned NOT NULL default '0',
  `u_lastonlinetstmp` int(10) unsigned NOT NULL default '0',
  `u_profilechangedtstmp` int(10) unsigned NOT NULL default '0',
  `u_imgfile` varchar(20) NOT NULL default '',
  `u_signature` varchar(100) NOT NULL default '',
  `u_profile_icq` int(11) NOT NULL default '0',
  `u_profile_url` varchar(100) NOT NULL default '',
  `u_profile_hobby` varchar(100) NOT NULL default '',
  `u_highlight` tinyint(3) unsigned NOT NULL default '0',
  `u_status` tinyint(3) unsigned NOT NULL default '0',
  `u_post` tinyint(3) unsigned NOT NULL default '1',
  `u_edit` tinyint(3) unsigned NOT NULL default '1',
  `u_admin` tinyint(3) unsigned NOT NULL default '0',
  `u_visible` tinyint(3) unsigned NOT NULL default '1',
  `u_skinid` smallint(5) unsigned NOT NULL default '1',
  `u_frame_top` tinyint(3) unsigned NOT NULL default '0',
  `u_frame_bottom` tinyint(3) unsigned NOT NULL default '0',
  `u_threadlistsort` varchar(20) NOT NULL default '',
  `u_timeoffset` smallint(5) unsigned NOT NULL default '0',
  `u_parseimg` tinyint(3) unsigned NOT NULL default '0',
  `u_replacetext` tinyint(3) unsigned NOT NULL default '1',
  `u_privatenotification` tinyint(3) unsigned NOT NULL default '0',
  `u_showsignatures` tinyint(3) unsigned NOT NULL default '1',
  PRIMARY KEY  (`u_id`),
  UNIQUE KEY `u_nickname` (`u_nickname`),
  KEY `u_lastonlinetstmp` (`u_lastonlinetstmp`)
);

INSERT INTO `pxm_user` (`u_nickname`, `u_password`)
VALUES ('test', '098f6bcd4621d373cade4e832627b4f6');

COMMIT;