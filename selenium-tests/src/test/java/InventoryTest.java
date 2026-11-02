
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.support.ui.ExpectedConditions;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.*;

public class InventoryTest {

    final String URL = "http://localhost:8081/login.html";
    final String EMAIL = "surya@medilink.com";
    final String PASSWORD = "095";

    WebDriver loginAndOpenInventory() {
        WebDriver driver = new ChromeDriver();

        try {
            driver.get(URL);

            driver.findElement(By.id("loginId")).sendKeys(EMAIL);
            driver.findElement(By.id("loginPass")).sendKeys(PASSWORD);
            driver.findElement(By.id("loginBtn")).click();

            WebDriverWait wait =
                new WebDriverWait(driver, Duration.ofSeconds(15));

            wait.until(ExpectedConditions.urlContains("dashboard.html"));

            driver.findElement(
                By.cssSelector("a[href='inventory.html']")
            ).click();

            wait.until(ExpectedConditions.urlContains("inventory.html"));

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

    // Test 1: Inventory page loads
    @Test
    void testInventoryPageLoad() {
        WebDriver driver = loginAndOpenInventory();

        try {
            assertTrue(driver.getTitle().contains("Inventory"));
            assertTrue(driver.findElement(
                By.id("inventoryTable")
            ).isDisplayed());

            System.out.println("Inventory page load test passed!");

        } finally {
            closeBrowser(driver);
        }
    }

    // Test 2: Inventory data loads
    @Test
    void testInventoryData() {
        WebDriver driver = loginAndOpenInventory();

        try {
            WebDriverWait wait =
                new WebDriverWait(driver, Duration.ofSeconds(15));

            wait.until(d -> {
                String text = d.findElement(
                    By.cssSelector("#inventoryTable tbody")
                ).getText();

                return !text.isEmpty()
                    && !text.contains("Loading");
            });

            String table = driver.findElement(
                By.cssSelector("#inventoryTable tbody")
            ).getText();

            assertFalse(table.contains("Failed to load inventory"));
            assertFalse(table.contains("No inventory items"));

            System.out.println("Inventory data test passed!");

        } finally {
            closeBrowser(driver);
        }
    }

    // Test 3: Inventory search field works
    @Test
    void testInventorySearch() {
        WebDriver driver = loginAndOpenInventory();

        try {
            WebDriverWait wait =
                new WebDriverWait(driver, Duration.ofSeconds(15));

            wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.id("inventorySearch")
            ));

            driver.findElement(By.id("inventorySearch"))
                  .sendKeys("Paracetamol");

            String searchValue = driver.findElement(
                By.id("inventorySearch")
            ).getAttribute("value");

            assertEquals("Paracetamol", searchValue);

            System.out.println("Inventory search test passed!");

        } finally {
            closeBrowser(driver);
        }
    }
}
