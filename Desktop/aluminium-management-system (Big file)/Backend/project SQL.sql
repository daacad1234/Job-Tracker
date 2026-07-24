CREATE DATABASE AluminiumMgtDB;

USE AluminiumMgtDB;

-- 1. Create Table: Roles
CREATE TABLE Roles (
    RoleID INT IDENTITY(1,1) PRIMARY KEY,
    RoleName VARCHAR(50) NOT NULL UNIQUE
);

-- 2. Create Table: Users
CREATE TABLE Users (
    UserID INT IDENTITY(1,1) PRIMARY KEY,
    Username VARCHAR(50) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    RoleID INT NOT NULL,
    FOREIGN KEY (RoleID) REFERENCES Roles(RoleID)
);

-- 3. Create Table: Customers
CREATE TABLE Customers (
    CustomerID INT IDENTITY(1,1) PRIMARY KEY,
    CustomerName VARCHAR(100) NOT NULL,
    Email VARCHAR(100) NULL,
    Phone VARCHAR(20) NOT NULL
);

-- 4. Create Table: AluminiumProducts
CREATE TABLE AluminiumProducts (
    ProductId INT IDENTITY(1,1) PRIMARY KEY, 
    ProfileName VARCHAR(150) NOT NULL,
    Color VARCHAR(50) NOT NULL,
    ThicknessMM DECIMAL(18,2) NOT NULL,
    PricePerMeter DECIMAL(18,2) NOT NULL,
    StockQty INT NOT NULL 
);
drop table Sales


-- 5. Create Table: Sales
CREATE TABLE Sales (
    SaleID INT IDENTITY(1,1) PRIMARY KEY,
    CustomerID INT NOT NULL,
    ProductID INT NOT NULL,
    Qty INT NOT NULL CHECK (Qty > 0),
    TotalPrice DECIMAL(18,2) NOT NULL,
    SaleDate DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID),
    FOREIGN KEY (ProductID) REFERENCES AluminiumProducts(ProductID)
);


INSERT INTO Roles (RoleName) VALUES 
('Admin'),
('Manager'),
('Salesman'),
('InventoryClerk'),
('Auditor');

INSERT INTO Users (Username, PasswordHash, RoleID) VALUES 
('ahmed_admin', 'AQAAAAIAAYagAAAAE...', 1),
('faiza_manager', 'AQAAAAIAAYagAAAAE...', 2),
('mohamed_sales', 'AQAAAAIAAYagAAAAE...', 3),
('halima_stock', 'AQAAAAIAAYagAAAAE...', 4),
('liban_audit', 'AQAAAAIAAYagAAAAE...', 5);

INSERT INTO Customers (CustomerName, Email, Phone) VALUES 
('Sahal Construction', 'info@sahal.so', '+252615111111'),
('Mogadishu Windows Ltd', 'mowindows@gmail.com', '+252615222222'),
('Al-Amanah Traders', 'amanah@hotmail.com', '+252615333333'),
('Eng Omar Ali', 'omar.ali@outlook.com', '+252615444444'),
('Banadir Aluminum Center', 'banadir.al@gmail.com', '+252615555555');

INSERT INTO AluminiumProducts (ProfileName, Color, ThicknessMM, PricePerMeter, StockQty) VALUES 
('Aluminium Sheet 4x8 ft', 'Silver', 2.50, 45.00, 120),
('Aluminium Rod 6m', 'Bronze', 5.00, 12.50, 85),
('Sliding Window Frame', 'Black', 1.80, 85.00, 200),
('Aluminium Door Frame', 'White', 2.00, 150.00, 60),
('U-Channel Profile 3m', 'Grey', 1.20, 18.75, 350);


INSERT INTO Sales (CustomerID, ProductID, Qty, TotalPrice, SaleDate) VALUES 
(1, 1, 10, 450.00, '2026-06-25 10:30:00'),
(2, 3, 5, 425.00, '2026-06-26 14:15:00'),
(3, 4, 2, 300.00, '2026-06-27 09:00:00'),
(4, 2, 20, 250.00, '2026-06-28 11:45:00'),
(5, 5, 40, 750.00, '2026-06-29 15:20:00');


SELECT * FROM Roles;
SELECT * FROM Users;
SELECT * FROM Customers;
SELECT * FROM AluminiumProducts;
SELECT * FROM Sales;
