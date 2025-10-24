import { test, expect } from '@playwright/test';

test.describe('CMMS Complete Workflow', () => {
  test.setTimeout(60000); // Set timeout to 60 seconds for all tests in this describe block

  // Test untuk alur Staff
  test('1. Staff: Login and create maintenance ticket', async ({ page }) => {
    // 1. Login sebagai staff
    await page.goto('/login');
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('networkidle');
    
    // Verify login page is loaded
    await expect(page.getByRole('heading', { name: 'CMMS Login' })).toBeVisible({ timeout: 10000 });

    const usernameInput = page.getByRole('textbox').first();
    const passwordInput = page.locator('input[type="password"]');
    const roleSelect = page.locator('select');

    // Fill in login form with retry mechanism
    await test.step('Fill login form', async () => {
      await expect(usernameInput).toBeVisible();
      await usernameInput.fill('staff');
      await expect(passwordInput).toBeVisible();
      await passwordInput.fill('staff123');
      await roleSelect.selectOption({ value: 'staff' });
    });

    const signInBtn = page.getByRole('button', { name: /👤.*Sign in as Staff/i });
    await expect(signInBtn).toBeVisible();
    await expect(signInBtn).toBeEnabled();

    // Set up promises for navigation and login request
    await test.step('Login and wait for navigation', async () => {
      // Set up response handler
      const responsePromise = page.waitForResponse(
        response => response.url().includes('/api/auth/login'),
        { timeout: 30000 }
      );

      // Click login button
      await signInBtn.click();

      // Wait for response and check it
      const response = await responsePromise;
      const responseBody = await response.json();
      console.log('Login response:', responseBody);

      if (response.ok()) {
        // Wait for navigation only if login was successful
        await page.waitForURL('**/staff/dashboard', { timeout: 30000 });
      } else {
        throw new Error(`Login failed: ${JSON.stringify(responseBody)}`);
      }
    });

    // Navigate to new ticket page
    await test.step('Create new ticket', async () => {
      await page.goto('/staff/new-ticket');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForLoadState('networkidle');

      // Fill ticket form
      await page.getByRole('combobox').selectOption('Komputer/Laptop');
      await page.getByPlaceholder(/Ruang 101/).fill('Ruang 2301');
      await page.getByPlaceholder(/Ringkasan singkat/).fill('Kerusakan Proyektor');
      await page.getByPlaceholder(/Jelaskan detail/).fill('Proyektor di ruang 2301 tidak menyala');
      await page.getByText('high').click();

      // Submit form and wait for response
      const responsePromise = page.waitForResponse(
        response => response.url().includes('/api/tickets') && response.request().method() === 'POST',
        { timeout: 30000 }
      );

      await page.getByRole('button', { name: /submit|buat|kirim/i }).click();
      const response = await responsePromise;

      // Verify successful creation
      expect(response.ok()).toBeTruthy();
      await page.waitForURL('**/staff/tickets', { timeout: 30000 });

      // Verify successful login
      await expect(page.getByText('Terjadi kesalahan')).not.toBeVisible();
    });

    // Verify no error message is visible
    await expect(page.getByText('Terjadi kesalahan pada server')).not.toBeVisible();
    await page.goto('/staff/new-ticket');
    
    // Set up alert handler before any actions
    page.on('dialog', async dialog => {
      expect(dialog.message()).toBe('Tiket berhasil dibuat!');
      await dialog.accept();
    });
    
    // Tunggu form muncul
    const pageTitle = page.getByRole('heading', { name: 'Buat Tiket Baru' });
    await expect(pageTitle).toBeVisible();
    
    // Isi form ticket menggunakan select dan text inputs
    const categorySelect = page.locator('select');
    await expect(categorySelect).toBeVisible();
    await categorySelect.selectOption('Komputer/Laptop');
    
    // Use placeholder text to find inputs
    const locationInput = page.getByPlaceholder(/Ruang 101/);
    await expect(locationInput).toBeVisible();
    await locationInput.fill('Ruang 2301');
    
    const subjectInput = page.getByPlaceholder(/Ringkasan singkat/);
    await expect(subjectInput).toBeVisible();
    await subjectInput.fill('Kerusakan Proyektor');
    
    const descriptionInput = page.getByPlaceholder(/Jelaskan detail/);
    await expect(descriptionInput).toBeVisible();
    await descriptionInput.fill('Proyektor di ruang 2301 tidak menyala');
    
    // Set prioritas using radio button text
    const priorityHigh = page.getByText('high');
    await expect(priorityHigh).toBeVisible();
    await priorityHigh.click();
    
    // Submit form
    const submitBtn = page.getByRole('button', { name: /submit|buat|kirim/i });
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    // Verify redirection
    await page.waitForURL('**/staff/tickets', { timeout: 10000 });
  });

  // Test untuk alur Admin
  test('2. Admin: Verify and assign ticket', async ({ page }) => {
    await test.step('Login as admin', async () => {
      // Navigate to login page
      await page.goto('/login');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForLoadState('networkidle');
      await expect(page.getByRole('heading', { name: 'CMMS Login' })).toBeVisible();

      // Fill login form
      const usernameInput = page.getByRole('textbox').first();
      const passwordInput = page.locator('input[type="password"]');
      const roleSelect = page.locator('select');

      await expect(usernameInput).toBeVisible();
      await usernameInput.fill('admin');
      await expect(passwordInput).toBeVisible();
      await passwordInput.fill('admin123');
      await roleSelect.selectOption({ value: 'admin' });

      // Login and wait for response
      const loginButton = page.getByRole('button', { name: /⚙️.*Sign in as Admin/i });
      await expect(loginButton).toBeVisible();
      await expect(loginButton).toBeEnabled();

      // Click and wait for response
      const [response] = await Promise.all([
        page.waitForResponse(
          response => response.url().includes('/api/auth/login'),
          { timeout: 30000 }
        ),
        page.waitForURL('**/admin/dashboard', { timeout: 30000 }),
        loginButton.click()
      ]);

      // Verify successful login
      const responseBody = await response.json();
      console.log('Admin login response:', responseBody);
      expect(response.ok()).toBeTruthy();
    });

    await test.step('Navigate to assignment page', async () => {
      await page.goto('/admin/assignment');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForLoadState('networkidle');

      // Wait for API responses
      const [ticketsResponse, assignmentsResponse] = await Promise.all([
        page.waitForResponse(
          response => 
            response.url().includes('/api/tickets') && 
            response.status() === 200,
          { timeout: 60000 }
        ),
        page.waitForResponse(
          response => 
            response.url().includes('/api/assignments') && 
            response.status() === 200,
          { timeout: 60000 }
        )
      ]);

      // Verify responses
      expect(ticketsResponse.ok()).toBeTruthy();
      expect(assignmentsResponse.ok()).toBeTruthy();
    });

    await test.step('Find and assign ticket', async () => {
      // Ensure the unassigned tickets section is visible
      const unassignedSection = page.getByRole('heading', { name: 'Tiket Belum Ditugaskan' });
      await expect(unassignedSection).toBeVisible({ timeout: 15000 });

      // Look for the specific ticket in unassigned tickets section
      const unassignedTable = page.locator('.bg-yellow-50 table');
      await expect(unassignedTable).toBeVisible();
      
      // Wait for data to load and find the first matching ticket
      const ticketRow = unassignedTable.locator('tr', {
        has: page.locator('td', { hasText: 'Kerusakan Proyektor' })
      }).first();
      await expect(ticketRow).toBeVisible({ timeout: 10000 });

      // Find and click the assign button in the found ticket row
      const assignButton = ticketRow.getByRole('button').first();
      await expect(assignButton).toBeEnabled();
      await assignButton.click();

      // Handle assignment dialog
      await page.waitForTimeout(1000); // Wait for dialog animation
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      
      const dialogPanel = dialog.getByTestId('assignment-dialog');
      await expect(dialogPanel).toBeVisible();
      
      const techSelect = dialogPanel.getByTestId('technician-select');
      await expect(techSelect).toBeVisible();
      
      // Tunggu data teknisi dimuat
      await page.waitForTimeout(1000);
      const options = await techSelect.locator('option').all();
      for (const option of options) {
        const text = await option.textContent();
        if (text && !text.includes('Busy') && !text.includes('Choose')) {
          const value = await option.getAttribute('value');
          await techSelect.selectOption(value || '');
          break;
        }
      }

      // Submit assignment
      const dialogAssignButton = dialog.getByRole('button', { name: 'Assign' });
      await expect(dialogAssignButton).toBeEnabled();

      // Click assign button and wait for state updates
      await dialogAssignButton.click();
      
      // Wait for unassigned ticket table to update
      await expect(unassignedTable.locator('tr').filter({ hasText: 'Kerusakan Proyektor' })).not.toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('dialog')).not.toBeVisible();
      await expect(ticketRow).not.toBeVisible();
    });
  });

  // Test untuk alur Teknisi
  test('3. Technician: Complete repair and submit report', async ({ page }) => {
    // Login sebagai teknisi
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'CMMS Login' })).toBeVisible();

    const usernameInput = page.getByRole('textbox').first();
    const passwordInput = page.locator('input[type="password"]');
    const roleSelect = page.locator('select');

    await usernameInput.fill('technician');
    await passwordInput.fill('tech123');
    await roleSelect.selectOption({ value: 'teknisi' });
    await page.getByRole('button', { name: /🔧.*Sign in as Teknisi/i }).click();

    // Akses halaman repair
    await page.waitForURL('**/teknisi/dashboard');
    await page.goto('/teknisi/repair');
    
    // Cari dan pilih tugas yang ditugaskan
    await page.getByPlaceholder('Search assignments...').fill('Kerusakan Proyektor');
    await page.getByRole('button', { name: /Start Repair/i }).first().click();

    // Isi form repair log
    await page.getByLabel('Description').fill('Proyektor sudah diperbaiki, perlu ganti lampu');
    await page.getByLabel('Action').fill('Mengganti lampu proyektor dengan yang baru');
    await page.getByLabel('Time Spent (minutes)').fill('45');
    
    // Upload foto hasil (jika ada)
    const fileInput = page.locator('input[type="file"]');
    if (await fileInput.count() > 0) {
      await fileInput.setInputFiles('test-files/repair-result.jpg');
    }

    // Submit repair log
    await page.getByRole('button', { name: /Submit|Complete|Selesai/i }).click();
    await expect(page.getByText(/Repair log berhasil/i)).toBeVisible();
  });

  // Test untuk alur Supervisor
  test('4. Supervisor: Review repair and materials', async ({ page }) => {
    // Login sebagai supervisor
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'CMMS Login' })).toBeVisible();

    const usernameInput = page.getByRole('textbox').first();
    const passwordInput = page.locator('input[type="password"]');
    const roleSelect = page.locator('select');

    await usernameInput.fill('supervisor');
    await passwordInput.fill('supervisor123');
    await roleSelect.selectOption({ value: 'supervisor' });
    await page.getByRole('button', { name: /👨‍💼.*Sign in as Supervisor/i }).click();

    // Review repair logs
    await page.waitForURL('**/supervisor/dashboard');
    await page.goto('/supervisor/reports');
    
    // Cari dan review repair log
    await page.getByPlaceholder('Search repairs...').fill('Kerusakan Proyektor');
    await page.getByRole('button', { name: /Review/i }).first().click();

    // Approve repair
    await page.getByLabel('Review Notes').fill('Pekerjaan sudah sesuai standar');
    await page.getByRole('button', { name: /Approve/i }).click();

    // Verifikasi approval berhasil
    await expect(page.getByText(/Review berhasil/i)).toBeVisible();
  });
});