
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.support.ui.ExpectedConditions;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.*;

public class DashboardTest {

    final String URL = "http://localhost:8081/login.html";
    final String EMAIL = "surya@medilink.com";
    final String PASSWORD = "095";

    WebDriver login() {
        WebDriver driver = new ChromeDriver();

        try {
            driver.get(URL);

            driver.findElement(By.id("loginId")).sendKeys(EMAIL);
            driver.findElement(By.id("loginPass")).sendKeys(PASSWORD);
            driver.findElement(By.id("loginBtn")).click();

            new WebDriverWait(driver, Duration.ofSeconds(15))
                .until(ExpectedConditions.urlContains("dashboard.html"));

            return driver;

        } catch (RuntimeException e) {
            driver.quit();
            throw e;
        }
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

    // Test 1: Dashboard loads successfully
    @Test
    void testDashboardLoad() {
        WebDriver driver = login();

        try {
            assertTrue(driver.getTitle().contains("Dashboard"));

            assertTrue(
                driver.findElement(By.id("refreshDataBtn")).isDisplayed()
            );

            System.out.println("Dashboard load test passed!");

        } finally {
            closeBrowser(driver);
        }
    }

    // Test 2: Resource cards load
    @Test
    void testResourceCards() {
        WebDriver driver = login();

        try {
            WebDriverWait wait =
                new WebDriverWait(driver, Duration.ofSeconds(15));

            // Wait until resource cards contain visible text
            wait.until(d ->
                d.findElements(By.cssSelector("#topCards .card"))
                 .size() > 0 &&
                !d.findElement(By.id("topCards"))
                  .getText().trim().isEmpty()
            );

            System.out.println("Resource cards test passed!");

        } finally {
            closeBrowser(driver);
        }
    }

    // Test 3: Hospital data loads into the dashboard
    @Test
    void testHospitalInformation() {
        WebDriver driver = login();

        try {
            WebDriverWait wait =
                new WebDriverWait(driver, Duration.ofSeconds(15));

            // Wait for hospital data to load
            wait.until(d ->
                !d.findElement(By.id("heroHospitals"))
                  .getText().equals("–")
            );

            String hospitalData =
                driver.findElement(By.id("heroHospitals")).getText();

            assertFalse(hospitalData.isEmpty());
            assertNotEquals("–", hospitalData);

            System.out.println("Hospital information test passed!");

        } finally {
            closeBrowser(driver);
        }
    }
}
