const API_BASE = 'http://127.0.0.1:8000/api/students/';

// ---------- DOM references ----------
const form = document.getElementById('student-form');
const idField = document.getElementById('student-id');
const nameField = document.getElementById('name');
const emailField = document.getElementById('email');
const phoneField = document.getElementById('phone');
const departmentField = document.getElementById('department');
const yearField = document.getElementById('year');
const addressField = document.getElementById('address');
const genderRadios = document.getElementsByName('gender');

const formMode = document.getElementById('form-mode');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');

const tbody = document.getElementById('student-tbody');
const emptyState = document.getElementById('empty-state');
const countBadge = document.getElementById('count-badge');
const searchInput = document.getElementById('search-input');
const banner = document.getElementById('banner');

const modal = document.getElementById('confirm-modal');
const confirmBody = document.getElementById('confirm-body');
const confirmDeleteBtn = document.getElementById('confirm-delete');
const confirmCancelBtn = document.getElementById('confirm-cancel');

let allStudents = [];
let pendingDeleteId = null;
let searchDebounce = null;

// ---------- Helpers ----------
function showBanner(message, type) {
  banner.textContent = message;
  banner.className = `banner ${type}`;
  banner.classList.remove('hidden');
  setTimeout(() => banner.classList.add('hidden'), 3500);
}

function clearFieldErrors() {
  document.querySelectorAll('.error').forEach(el => (el.textContent = ''));
}

function getSelectedGender() {
  for (const radio of genderRadios) {
    if (radio.checked) return radio.value;
  }
  return '';
}

function setSelectedGender(value) {
  for (const radio of genderRadios) {
    radio.checked = radio.value === value;
  }
}

function resetForm() {
  form.reset();
  idField.value = '';
  clearFieldErrors();
  formMode.textContent = 'New Entry';
  submitBtn.textContent = 'Add student';
  cancelBtn.classList.add('hidden');
}

// ---------- Client-side validation ----------
function validateForm(data) {
  const errors = {};

  if (!data.name.trim()) errors.name = 'Name is required.';

  if (!data.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (!data.phone.trim()) {
    errors.phone = 'Phone number is required.';
  } else if (!/^\d{10}$/.test(data.phone)) {
    errors.phone = 'Phone number must be exactly 10 digits.';
  }

  if (!data.department) errors.department = 'Department is required.';
  if (!data.year) errors.year = 'Year is required.';
  if (!data.gender) errors.gender = 'Please select a gender.';

  return errors;
}

function renderErrors(errors) {
  clearFieldErrors();
  Object.entries(errors).forEach(([field, message]) => {
    const el = document.getElementById(`err-${field}`);
    // Backend errors may come back as arrays
    const text = Array.isArray(message) ? message[0] : message;
    if (el) el.textContent = text;
  });
}

// ---------- API calls ----------
async function fetchStudents(query = '') {
  try {
    const url = query ? `${API_BASE}?search=${encodeURIComponent(query)}` : API_BASE;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to load students.');
    allStudents = await res.json();
    renderTable(allStudents);
  } catch (err) {
    showBanner(`Could not reach the server. Is Django running at ${API_BASE}? (${err.message})`, 'error');
  }
}

async function createStudent(payload) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw { fieldErrors: data };
  return data;
}

async function updateStudent(id, payload) {
  const res = await fetch(`${API_BASE}${id}/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw { fieldErrors: data };
  return data;
}

async function deleteStudent(id) {
  const res = await fetch(`${API_BASE}${id}/`, { method: 'DELETE' });
  if (!res.ok && res.status !== 204) throw new Error('Failed to delete student.');
}

// ---------- Rendering ----------
function renderTable(students) {
  tbody.innerHTML = '';
  countBadge.textContent = students.length;

  if (students.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }
  emptyState.classList.add('hidden');

  for (const s of students) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${s.id}</td>
      <td>${escapeHtml(s.name)}</td>
      <td>${escapeHtml(s.email)}</td>
      <td>${escapeHtml(s.phone)}</td>
      <td>${escapeHtml(s.department)}</td>
      <td>${escapeHtml(String(s.year))}</td>
      <td>${escapeHtml(s.gender)}</td>
      <td>${escapeHtml(s.address || '—')}</td>
      <td class="actions-cell">
        <button class="btn btn-link btn-ghost" data-action="edit" data-id="${s.id}">Edit</button>
        <button class="btn btn-link" style="color:#a23b3b" data-action="delete" data-id="${s.id}">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ---------- Edit flow ----------
function loadStudentIntoForm(student) {
  idField.value = student.id;
  nameField.value = student.name;
  emailField.value = student.email;
  phoneField.value = student.phone;
  departmentField.value = student.department;
  yearField.value = student.year;
  setSelectedGender(student.gender);
  addressField.value = student.address || '';

  formMode.textContent = `Editing #${student.id}`;
  submitBtn.textContent = 'Save changes';
  cancelBtn.classList.remove('hidden');
  clearFieldErrors();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ---------- Delete flow ----------
function openConfirm(id, name) {
  pendingDeleteId = id;
  confirmBody.textContent = `"${name}" will be permanently removed from the registry.`;
  modal.classList.remove('hidden');
}

function closeConfirm() {
  pendingDeleteId = null;
  modal.classList.add('hidden');
}

// ---------- Event listeners ----------
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const payload = {
    name: nameField.value.trim(),
    email: emailField.value.trim(),
    phone: phoneField.value.trim(),
    department: departmentField.value,
    year: yearField.value ? Number(yearField.value) : '',
    gender: getSelectedGender(),
    address: addressField.value.trim(),
  };

  const errors = validateForm(payload);
  if (Object.keys(errors).length > 0) {
    renderErrors(errors);
    return;
  }
  clearFieldErrors();

  const editingId = idField.value;
  submitBtn.disabled = true;

  try {
    if (editingId) {
      await updateStudent(editingId, payload);
      showBanner('Student updated successfully.', 'success');
    } else {
      await createStudent(payload);
      showBanner('Student added successfully.', 'success');
    }
    resetForm();
    await fetchStudents(searchInput.value.trim());
  } catch (err) {
    if (err.fieldErrors) {
      renderErrors(err.fieldErrors);
      showBanner('Please fix the highlighted fields.', 'error');
    } else {
      showBanner('Something went wrong talking to the server.', 'error');
    }
  } finally {
    submitBtn.disabled = false;
  }
});

cancelBtn.addEventListener('click', resetForm);

tbody.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  const id = btn.dataset.id;
  const student = allStudents.find(s => String(s.id) === id);
  if (!student) return;

  if (btn.dataset.action === 'edit') {
    loadStudentIntoForm(student);
  } else if (btn.dataset.action === 'delete') {
    openConfirm(student.id, student.name);
  }
});

confirmCancelBtn.addEventListener('click', closeConfirm);
modal.addEventListener('click', (e) => {
  if (e.target === modal) closeConfirm();
});

confirmDeleteBtn.addEventListener('click', async () => {
  if (pendingDeleteId == null) return;
  try {
    await deleteStudent(pendingDeleteId);
    showBanner('Student deleted successfully.', 'success');
    if (idField.value === String(pendingDeleteId)) resetForm();
    closeConfirm();
    await fetchStudents(searchInput.value.trim());
  } catch (err) {
    showBanner('Could not delete this student.', 'error');
    closeConfirm();
  }
});

searchInput.addEventListener('input', () => {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => {
    fetchStudents(searchInput.value.trim());
  }, 300);
});

// ---------- Init ----------
fetchStudents();
