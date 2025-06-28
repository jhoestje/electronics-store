Feature: User Registration API
  As an unregistered user
  I want to register on the website with my email, password and username
  So that I can be a registered user and be able to login and make purchases

  Background:
    Given the API server is running at "http://localhost:8080/api"

  Scenario: Successful user registration
    When I send a POST request to "/auth/register" with:
      | username | johnsmith           |
      | email    | johnsmith@email.com |
      | password | Password123!        |
    Then the response status code should be 200
    And the response should contain a field "token"
    And the response should contain a user with username "johnsmith"
    And the response should contain a user with email "johnsmith@email.com"

  Scenario: Cannot register with an existing username
    Given a user exists with username "existinguser" and email "existing@email.com"
    When I send a POST request to "/auth/register" with:
      | username | existinguser       |
      | email    | newuser@email.com  |
      | password | Password123!       |
    Then the response status code should be 400
    And the response should contain error "Username already exists"

  Scenario: Cannot register with an existing email
    Given a user exists with username "existinguser" and email "existing@email.com"
    When I send a POST request to "/auth/register" with:
      | username | newusername        |
      | email    | existing@email.com |
      | password | Password123!       |
    Then the response status code should be 400
    And the response should contain error "Email already exists"

  Scenario: Cannot register with missing required fields
    When I send a POST request to "/auth/register" with:
      | username | testuser         |
      | email    |                  |
      | password | Password123!     |
    Then the response status code should be 400
    And the response should contain error about missing required field

  Scenario: Newly registered user can successfully login
    Given I successfully registered a user with:
      | username | newuser          |
      | email    | newuser@mail.com |
      | password | SecurePass123!   |
    When I send a POST request to "/auth/login" with:
      | username | newuser          |
      | password | SecurePass123!   |
    Then the response status code should be 200
    And the response should contain a field "token"
    And the response should contain a user with username "newuser"

  Scenario Outline: Registration with various password strengths
    When I send a POST request to "/auth/register" with:
      | username | <username>        |
      | email    | <email>           |
      | password | <password>        |
    Then the response status code should be <status_code>
    And the response <should_or_should_not> contain error

    Examples:
      | username      | email                | password      | status_code | should_or_should_not |
      | strongpass    | strong@example.com   | P@ssw0rd123!  | 200         | should not           |
      | weakpass1     | weak1@example.com    | password      | 400         | should               |
      | weakpass2     | weak2@example.com    | 12345         | 400         | should               |
      | mediumpass    | medium@example.com   | Password123   | 200         | should not           |

  Scenario: Registration creates customer role by default
    When I send a POST request to "/auth/register" with:
      | username | normaluser           |
      | email    | normaluser@email.com |
      | password | Password123!         |
    Then the response status code should be 200
    And the response should contain a user with role "ROLE_CUSTOMER"
