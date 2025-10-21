import { test, expect } from '@playwright/test';

test.describe('CMMS Complete Workflow', () => {
  // Test untuk alur Staff
  test('1. Staff: Login and create maintenance ticket', async ({ page }) => {
    // 1. Login sebagai staff
    await page.goto('/login');
    await expect(page.getByText('CMMS Login')).toBeVisible({ timeout: 10000 });

    const usernameInput = page.getByRole('textbox').first();
    const passwordInput = page.locator('input[type="password"]');
    const roleSelect = page.locator('select');

    await expect(usernameInput).toBeVisible();
    await usernameInput.fill('staff');
    await expect(passwordInput).toBeVisible();
    await passwordInput.fill('staff123');
    await roleSelect.selectOption({ value: 'staff' });

    const signInBtn = page.getByRole('button', { name: /👤.*Sign in as Staff/i });
    await expect(signInBtn).toBeVisible();
    await expect(signInBtn).toBeEnabled();
    await signInBtn.click();

    // 2. Buat ticket baru
    await page.waitForURL('**/staff/dashboard');
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
    // Login sebagai admin
    await page.goto('/login');
    await expect(page.getByText('CMMS Login')).toBeVisible();

    const usernameInput = page.getByRole('textbox').first();
    const passwordInput = page.locator('input[type="password"]');
    const roleSelect = page.locator('select');

    await expect(usernameInput).toBeVisible();
    await usernameInput.fill('admin');
    await expect(passwordInput).toBeVisible();
    await passwordInput.fill('admin123');
    await roleSelect.selectOption({ value: 'admin' });

    // Set up navigation promises before clicking
    const navigationPromise = page.waitForURL('**/admin/dashboard');
    const networkIdlePromise = page.waitForLoadState('networkidle');
    const loginButton = page.getByRole('button', { name: /⚙️.*Sign in as Admin/i });

    // Click and wait for all navigation to complete
    await Promise.all([
      navigationPromise,
      networkIdlePromise,
      loginButton.click()
    ]);

    // Set up API response handlers before navigation
    page.on('dialog', async dialog => {
      expect(dialog.message()).toBe('Implement assignment modal');
      await dialog.accept();
    });

    // Go to assignment page and wait for API responses
    const responsePromise1 = page.waitForResponse(response => 
      response.url().includes('/api/tickets') && response.status() === 200
    );
    const responsePromise2 = page.waitForResponse(response => 
      response.url().includes('/api/assignments') && response.status() === 200
    );
    
    await page.goto('/admin/assignment');
    
    // Wait for responses and page load
    await Promise.all([
      responsePromise1,
      responsePromise2,
      page.waitForLoadState('domcontentloaded'),
      page.waitForLoadState('networkidle')
    ]);

    // Ensure the unassigned tickets section is visible
    const unassignedSection = page.getByRole('heading', { name: 'Tiket Belum Ditugaskan' });
    await expect(unassignedSection).toBeVisible({ timeout: 15000 });

    // Look for the specific ticket
    const ticketCell = page.getByRole('cell', { name: 'Kerusakan Proyektor' });
    await expect(ticketCell).toBeVisible({ timeout: 10000 });

    // Find the row containing our ticket
    const ticketRow = ticketCell.locator('..'); // Get parent tr
    await expect(ticketRow).toBeVisible();

    // Verify priority badge
    const priorityBadge = ticketRow.getByRole('cell').filter({ hasText: 'HIGH' });
    await expect(priorityBadge).toBeVisible();

    // Find and click the assign button in that row
    const assignButton = ticketRow.getByRole('button', { name: 'Tugaskan' });
    await expect(assignButton).toBeEnabled();
    await assignButton.click();

    // TODO: Implement assignment form handling after the modal is added
  });

  // Test untuk alur Teknisi
  test('3. Technician: Complete repair and submit report', async ({ page }) => {
    // Login sebagai teknisi
    await page.goto('/login');
    await expect(page.getByText('CMMS Login')).toBeVisible();

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
    await expect(page.getByText('CMMS Login')).toBeVisible();

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