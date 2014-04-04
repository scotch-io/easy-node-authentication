CREATE DATABASE `pricebeater_share`;

-- remote
grant all privileges on pricebeater_share.* to 'pricebeater'@'%' identified by '80d66d04589b4ee780e92a63eb5e7f68';
-- local
-- grant all privileges on pricebeater_share.* to 'pricebeater'@'localhost' identified by '80d66d04589b4ee780e92a63eb5e7f68';

FLUSH PRIVILEGES;
