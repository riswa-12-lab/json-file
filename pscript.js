/* =========================================================
MediSphere Portal Script (Final Version)
Shows doctors with their specialties in Available Doctors
Author: Riswa
========================================================= */

// --- Calendar setup and LocalStorage key ---
let calendarCurrentDate = new Date();
const USER_APPOINTMENT_KEY = 'user_appointments';

// --- JSON data sources ---
const DOCTORS_URL = 'https://jsethi-mdx.github.io/cst2572.github.io/doctors.json
';
const SPECIALTY_URL = 'https://raw.githubusercontent.com/riswa-12-lab/json-file/refs/heads/main/specialities.json
';
const MEDICINES_URL = 'https://jsethi-mdx.github.io/cst2572.github.io/medicines.json
';

/* =========================================================
IndexedDB Databases Setup
========================================================= */

// Doctors DB
const DOCTORS_DB_NAME = 'MediSphereDoctorsDB';
const DOCTORS_STORE_NAME = 'doctors';
let doctorsDB;

// Specialties DB
const SPECIALTY_DB_NAME = 'MediSphereSpecialtyDB';
const SPECIALTY_STORE_NAME = 'specialties';
let specialtyDB;

// Medicines DB
const MEDICINE_DB_NAME = 'MediSphereMedicineDB';
const MEDICINE_STORE_NAME = 'medicines';
let medicinesDB;

/* =========================================================
Utility Functions
========================================================= */

// Makes text safe for HTML
function escapeHtml(unsafe) {
if (typeof unsafe !== 'string') unsafe = String(unsafe);
return unsafe.replace(/&/g, "&")
.replace(/</g, "<")
.replace(/>/g, ">")
.replace(/"/g, """)
.replace(/'/g, "'");
}

/* =========================================================
Local Storage for Appointments
========================================================= */

function getAppointments() {
const saved = localStorage.getItem(USER_APPOINTMENT_KEY);
return saved ? JSON.parse(saved) : [];
}

function saveAppointments(appointments) {
localStorage.setItem(USER_APPOINTMENT_KEY, JSON.stringify(appointments));
}

/* =========================================================
Portal Initialization
========================================================= */

function initializePortal() {
setupNavigation();
openDoctorsDB();
openSpecialtyDB();
openMedicinesDB();
showSection('dashboard');
}

// Handles top navigation
function setupNavigation() {
document.querySelectorAll('.nav-item').forEach(item => {
item.addEventListener('click', () => {
const sectionId = item.getAttribute('data-section');
showSection(sectionId);
});
});
}

// Shows a chosen section
function showSection(sectionId) {
document.querySelectorAll('.section').forEach(sec => sec.classList.add('hidden'));
const target = document.getElementById(sectionId);
if (target) target.classList.remove('hidden');
}

/* =========================================================
Doctors Database + Display
========================================================= */

function openDoctorsDB() {
const req = indexedDB.open(DOCTORS_DB_NAME, 1);
req.onupgradeneeded = function(e) {
doctorsDB = e.target.result;
if (!doctorsDB.objectStoreNames.contains(DOCTORS_STORE_NAME)) {
doctorsDB.createObjectStore(DOCTORS_STORE_NAME, { keyPath: 'id' });
}
};
req.onsuccess = function(e) {
doctorsDB = e.target.result;
fetchAndStoreDoctors();
};
req.onerror = function() {
console.error('Failed to open Doctors DB');
};
}

function fetchAndStoreDoctors() {
if (!doctorsDB) return;
fetch(DOCTORS_URL)
.then(res => res.json())
.then(data => {
const tx = doctorsDB.transaction(DOCTORS_STORE_NAME, 'readwrite');
const store = tx.objectStore(DOCTORS_STORE_NAME);
store.clear();
const list = data.doctors || data;
list.forEach((d, i) => {
d.id = d.id || doc-${i + 1};
store.put(d);
});
renderDoctorsList(list);
})
.catch(err => console.error('Doctor fetch error:', err));
}

/* =========================================================
Specialties Database
========================================================= */

function openSpecialtyDB() {
const req = indexedDB.open(SPECIALTY_DB_NAME, 1);
req.onupgradeneeded = function(e) {
specialtyDB = e.target.result;
if (!specialtyDB.objectStoreNames.contains(SPECIALTY_STORE_NAME)) {
specialtyDB.createObjectStore(SPECIALTY_STORE_NAME, { keyPath: 'id' });
}
};
req.onsuccess = function(e) {
specialtyDB = e.target.result;
fetchAndStoreSpecialties();
};
req.onerror = function() {
console.error('Failed to open Specialty DB');
};
}

function fetchAndStoreSpecialties() {
if (!specialtyDB) return;
fetch(SPECIALTY_URL)
.then(res => res.json())
.then(data => {
const tx = specialtyDB.transaction(SPECIALTY_STORE_NAME, 'readwrite');
const store = tx.objectStore(SPECIALTY_STORE_NAME);
store.clear();
data.forEach(item => store.put(item));
console.log('Specialties stored successfully.');
})
.catch(err => console.error('Specialty fetch error:', err));
}

/* =========================================================
Show Doctors + Specialty in Table
========================================================= */

function renderDoctorsList(doctors) {
const container = document.getElementById('doctors-list-container');
if (!container) return;
container.innerHTML = ''; // clear old

const table = document.createElement('table');
table.classList.add('doctor-table');

const headerRow = document.createElement('tr');
headerRow.innerHTML = `
    <th>ID</th>
    <th>Doctor Name</th>
    <th>Specialty</th>
`;
table.appendChild(headerRow);

doctors.forEach(d => {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${escapeHtml(d.id)}</td>
        <td>${escapeHtml(d.name || 'Unknown')}</td>
        <td>${escapeHtml(d.specialty || 'Not listed')}</td>
    `;
    table.appendChild(row);
});

container.appendChild(table);


}

/* =========================================================
Medicines Database (for Pharmacy Section)
========================================================= */

function openMedicinesDB() {
const req = indexedDB.open(MEDICINE_DB_NAME, 1);
req.onupgradeneeded = function(e) {
medicinesDB = e.target.result;
if (!medicinesDB.objectStoreNames.contains(MEDICINE_STORE_NAME)) {
medicinesDB.createObjectStore(MEDICINE_STORE_NAME, { keyPath: 'id' });
}
};
req.onsuccess = function(e) {
medicinesDB = e.target.result;
fetchAndStoreMedicines();
};
}

function fetchAndStoreMedicines() {
if (!medicinesDB) return;
fetch(MEDICINES_URL)
.then(res => res.json())
.then(data => {
const tx = medicinesDB.transaction(MEDICINE_STORE_NAME, 'readwrite');
const store = tx.objectStore(MEDICINE_STORE_NAME);
store.clear();
const list = data.medicines || data;
list.forEach((m, i) => {
m.id = m.id || med-${i + 1};
store.put(m);
});
})
.catch(err => console.error('Medicine fetch error:', err));
}

/* =========================================================
Initialize Everything
========================================================= */

document.addEventListener('DOMContentLoaded', initializePortal);