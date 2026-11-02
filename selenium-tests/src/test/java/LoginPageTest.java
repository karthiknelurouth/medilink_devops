
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.*;

public class LoginPageTest {

    final String URL = "http://localhost:8081/login.html";
    final String EMAIL = "surya@medilink.com";
    final String PASSWORD = "095";

    WebDriver openBrowser() {
        WebDriver driver = new ChromeDriver();
        driver.get(URL);
        return driver;
    }

    WebDriverWait waitFor(WebDriver driver) {
        return new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    // Wait 1 second before closing Chrome
    void closeBrowser(WebDriver driver) {
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } finally {
            driver.quit();
        }
    }

    // Test 1: Login page loads
    @Test
    void testPageLoad() {
        WebDriver driver = openBrowser();

        try {
            assertTrue(driver.getTitle().contains("MediLink"));
            System.out.println("Page load test passed!");
        } finally {
            closeBrowser(driver);
        }
    }

    // Test 2: Empty fields validation
    @Test
    void testEmptyLogin() {
        WebDriver driver = openBrowser();

        try {
            driver.findElement(By.id("loginBtn")).click();

            String error = driver.findElement(
                By.id("loginError")
            ).getText();

            assertEquals("Please fill in all fields.", error);

            System.out.println("Empty login test passed!");
        } finally {
            closeBrowser(driver);
        }
    }

    // Test 3: Invalid credentials
    @Test
    void testInvalidLogin() {
        WebDriver driver = openBrowser();

        try {
            driver.findElement(By.id("loginId"))
                  .sendKeys("invalid@example.com");

            driver.findElement(By.id("loginPass"))
                  .sendKeys("wrongpassword");

            driver.findElement(By.id("loginBtn")).click();

            waitFor(driver).until(d ->
                !d.findElement(By.id("loginError"))
                  .getText().isEmpty()
            );

            String error = driver.findElement(
                By.id("loginError")
            ).getText();

            assertFalse(error.contains("Server error"));
            assertFalse(error.isEmpty());

            System.out.println("Invalid login test passed!");
        } finally {
            closeBrowser(driver);
        }
    }

    // Test 4: Successful hospital login
    @Test
    void testHospitalLogin() {
        WebDriver driver = openBrowser();

        try {
            driver.findElement(By.id("loginId"))
                  .sendKeys(EMAIL);

            driver.findElement(By.id("loginPass"))
                  .sendKeys(PASSWORD);

            driver.findElement(By.id("loginBtn")).click();

            waitFor(driver).until(d ->
                d.getCurrentUrl().contains("dashboard.html")
            );

            assertTrue(
                driver.getCurrentUrl().contains("dashboard.html")
            );

            System.out.println("Hospital login test passed!");
        } finally {
            closeBrowser(driver);
        }
    }

    // Test 5: Password is masked
    @Test
    void testPasswordMasking() {
        WebDriver driver = openBrowser();

        try {
            String type = driver.findElement(
                By.id("loginPass")
            ).getAttribute("type");

            assertEquals("password", type);

            System.out.println("Password masking test passed!");
        } finally {
            closeBrowser(driver);
        }
    }

    // Test 6: Registration page navigation
    @Test
    void testRegistrationLink() {
        WebDriver driver = openBrowser();

        try {
            driver.findElement(
                By.cssSelector("a[href='register.html']")
            ).click();

            waitFor(driver).until(d ->
                d.getCurrentUrl().contains("register.html")
            );

            assertTrue(
                driver.getCurrentUrl().contains("register.html")
            );

            System.out.println("Registration link test passed!");
        } finally {
            closeBrowser(driver);
        }
    }

    // Test 7: Enter key submits login
    @Test
    void testEnterKeyLogin() {
        WebDriver driver = openBrowser();

        try {
            driver.findElement(By.id("loginId"))
                  .sendKeys("invalid@example.com");

            driver.findElement(By.id("loginPass"))
                  .sendKeys("wrongpassword");

            driver.findElement(By.id("loginPass"))
                  .sendKeys(org.openqa.selenium.Keys.ENTER);

            waitFor(driver).until(d ->
                !d.findElement(By.id("loginError"))
                  .getText().isEmpty()
            );

            String error = driver.findElement(
                By.id("loginError")
            ).getText();

            assertFalse(error.contains("Server error"));
            assertFalse(error.isEmpty());

            System.out.println("Enter key test passed!");
        } finally {
            closeBrowser(driver);
        }
    }
}
