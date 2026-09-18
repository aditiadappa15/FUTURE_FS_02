const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "/login.html";
}

const leadsTableBody = document.getElementById("leadsTableBody");
const leadForm = document.getElementById("leadForm");
const leadMessageText = document.getElementById("leadMessageText");

const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const sourceFilter = document.getElementById("sourceFilter");

const leadModal = document.getElementById("leadModal");
const closeModal = document.getElementById("closeModal");
const leadDetails = document.getElementById("leadDetails");
const notesList = document.getElementById("notesList");

const noteForm = document.getElementById("noteForm");
const noteInput = document.getElementById("noteInput");
const noteMessage = document.getElementById("noteMessage");

let currentLeadId = null;
let allLeads = [];


// Load dashboard statistics
async function loadStats() {
    try {
        const response = await fetch("/api/dashboard/stats", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (response.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "/login.html";
            return;
        }

        const data = await response.json();

        document.getElementById("totalLeads").textContent =
            data.totalLeads;

        document.getElementById("newLeads").textContent =
            data.newLeads;

        document.getElementById("contactedLeads").textContent =
            data.contactedLeads;

        document.getElementById("convertedLeads").textContent =
            data.convertedLeads;

        document.getElementById("conversionPercentage").textContent =
            data.conversionPercentage + "%";

    } catch (error) {
        console.error("Failed to load statistics:", error);
    }
}


// Load all leads
async function loadLeads() {
    try {
        const response = await fetch("/api/leads", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (response.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "/login.html";
            return;
        }

        const data = await response.json();

        allLeads = data;

        displayLeads(allLeads);

    } catch (error) {
        console.error("Failed to load leads:", error);
    }
}


// Display leads
function displayLeads(leads) {
    leadsTableBody.innerHTML = "";

    if (leads.length === 0) {
        leadsTableBody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align:center;">
                    No leads found
                </td>
            </tr>
        `;

        return;
    }

    leads.forEach(lead => {

        const row = document.createElement("tr");

        const date = lead.createdAt
            ? new Date(lead.createdAt).toLocaleDateString()
            : "";

        row.innerHTML = `
            <td>${lead.name}</td>

            <td>${lead.email}</td>

            <td>${lead.phone || "-"}</td>

            <td>${lead.company || "-"}</td>

            <td>${lead.source || "-"}</td>

            <td>
                <select
                    class="status-select"
                    onchange="changeStatus('${lead._id}', this.value)"
                >
                    <option
                        value="New"
                        ${lead.status === "New" ? "selected" : ""}
                    >
                        New
                    </option>

                    <option
                        value="Contacted"
                        ${lead.status === "Contacted" ? "selected" : ""}
                    >
                        Contacted
                    </option>

                    <option
                        value="Converted"
                        ${lead.status === "Converted" ? "selected" : ""}
                    >
                        Converted
                    </option>
                </select>
            </td>

            <td>${date}</td>

            <td>

                <button
                    class="action-btn view-btn"
                    onclick="viewLead('${lead._id}')"
                >
                    View
                </button>

                <button
                    class="action-btn edit-btn"
                    onclick="editLead('${lead._id}')"
                >
                    Edit
                </button>

                <button
                    class="action-btn delete-btn"
                    onclick="deleteLead('${lead._id}')"
                >
                    Delete
                </button>

            </td>
        `;

        leadsTableBody.appendChild(row);
    });
}


// Direct status change
async function changeStatus(id, status) {
    try {
        const response = await fetch(`/api/leads/${id}`, {
            method: "PUT",

            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },

            body: JSON.stringify({
                status: status
            })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message);
            return;
        }

        await loadLeads();
        await loadStats();

    } catch (error) {
        console.error("Status update error:", error);

        alert("Failed to update status");
    }
}


// Add or update lead
leadForm.addEventListener("submit", async event => {

    event.preventDefault();

    const leadData = {
        name: document.getElementById("leadName").value,
        email: document.getElementById("leadEmail").value,
        phone: document.getElementById("leadPhone").value,
        company: document.getElementById("leadCompany").value,
        source: document.getElementById("leadSource").value,
        status: document.getElementById("leadStatus").value,
        message: document.getElementById("leadMessage").value
    };

    const editingId = leadForm.dataset.editingId;

    try {

        let response;

        if (editingId) {

            response = await fetch(`/api/leads/${editingId}`, {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },

                body: JSON.stringify(leadData)
            });

        } else {

            response = await fetch("/api/leads", {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },

                body: JSON.stringify(leadData)
            });
        }

        const data = await response.json();

        if (!response.ok) {

            leadMessageText.textContent =
                data.message;

            return;
        }

        if (editingId) {

            leadMessageText.textContent =
                "Lead updated successfully!";

            delete leadForm.dataset.editingId;

        } else {

            leadMessageText.textContent =
                "Lead added successfully!";
        }

        leadForm.reset();

        await loadLeads();
        await loadStats();

        setTimeout(() => {
            leadMessageText.textContent = "";
        }, 3000);

    } catch (error) {

        console.error("Save lead error:", error);

        leadMessageText.textContent =
            "Failed to save lead";
    }
});


// Edit lead
async function editLead(id) {

    try {

        const response = await fetch(`/api/leads/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (response.status === 401) {

            localStorage.removeItem("token");

            window.location.href =
                "/login.html";

            return;
        }

        const lead = await response.json();

        document.getElementById("leadName").value =
            lead.name;

        document.getElementById("leadEmail").value =
            lead.email;

        document.getElementById("leadPhone").value =
            lead.phone || "";

        document.getElementById("leadCompany").value =
            lead.company || "";

        document.getElementById("leadSource").value =
            lead.source || "Other";

        document.getElementById("leadStatus").value =
            lead.status || "New";

        document.getElementById("leadMessage").value =
            lead.message || "";

        leadForm.dataset.editingId =
            id;

        document.getElementById("add-lead").scrollIntoView({
            behavior: "smooth"
        });

    } catch (error) {

        console.error("Edit lead error:", error);

        alert("Failed to load lead");
    }
}


// View lead
async function viewLead(id) {

    try {

        currentLeadId = id;

        const response =
            await fetch(`/api/leads/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

        if (!response.ok) {

            alert("Failed to load lead");

            return;
        }

        const lead = await response.json();

        const createdDate =
            lead.createdAt
                ? new Date(
                    lead.createdAt
                ).toLocaleString()
                : "-";

        const updatedDate =
            lead.updatedAt
                ? new Date(
                    lead.updatedAt
                ).toLocaleString()
                : "-";

        leadDetails.innerHTML = `

            <p>
                <strong>Name:</strong>
                ${lead.name}
            </p>

            <p>
                <strong>Email:</strong>
                ${lead.email}
            </p>

            <p>
                <strong>Phone:</strong>
                ${lead.phone || "-"}
            </p>

            <p>
                <strong>Company:</strong>
                ${lead.company || "-"}
            </p>

            <p>
                <strong>Source:</strong>
                ${lead.source || "-"}
            </p>

            <p>
                <strong>Status:</strong>
                ${lead.status || "-"}
            </p>

            <p>
                <strong>Message:</strong>
                ${lead.message || "-"}
            </p>

            <p>
                <strong>Created:</strong>
                ${createdDate}
            </p>

            <p>
                <strong>Updated:</strong>
                ${updatedDate}
            </p>

        `;

        leadModal.style.display = "block";

        await loadNotes(id);

    } catch (error) {

        console.error("View lead error:", error);

        alert("Failed to load lead");
    }
}


// Load notes
async function loadNotes(id) {

    try {

        const response =
            await fetch(`/api/leads/${id}/notes`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

        if (!response.ok) {

            notesList.innerHTML =
                "<p>Failed to load notes.</p>";

            return;
        }

        const notes = await response.json();

        notesList.innerHTML = "";

        if (notes.length === 0) {

            notesList.innerHTML =
                "<p>No follow-up notes yet.</p>";

            return;
        }

        notes.forEach(note => {

            const noteDate =
                note.createdAt
                    ? new Date(
                        note.createdAt
                    ).toLocaleString()
                    : "";

            const noteElement =
                document.createElement("div");

            noteElement.className =
                "note-item";

            noteElement.innerHTML = `

                <p>
                    ${note.note}
                </p>

                <span class="note-date">
                    ${noteDate}
                </span>

            `;

            notesList.appendChild(
                noteElement
            );
        });

    } catch (error) {

        console.error(
            "Failed to load notes:",
            error
        );

        notesList.innerHTML =
            "<p>Failed to load notes.</p>";
    }
}


// Add note
noteForm.addEventListener("submit", async event => {

    event.preventDefault();

    if (!currentLeadId) {
        return;
    }

    const note =
        noteInput.value.trim();

    if (!note) {
        return;
    }

    try {

        const response =
            await fetch(
                `/api/leads/${currentLeadId}/notes`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        note: note
                    })
                }
            );

        const data =
            await response.json();

        if (!response.ok) {

            noteMessage.textContent =
                data.message;

            return;
        }

        noteInput.value = "";

        noteMessage.textContent =
            "Note added successfully!";

        await loadNotes(
            currentLeadId
        );

        setTimeout(() => {

            noteMessage.textContent =
                "";

        }, 3000);

    } catch (error) {

        console.error(
            "Add note error:",
            error
        );

        noteMessage.textContent =
            "Failed to add note";
    }
});


// Close modal
closeModal.addEventListener("click", () => {

    leadModal.style.display =
        "none";

    currentLeadId = null;
});


// Close modal by clicking outside
window.addEventListener("click", event => {

    if (event.target === leadModal) {

        leadModal.style.display =
            "none";

        currentLeadId = null;
    }
});


// Delete lead
async function deleteLead(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this lead?"
        );

    if (!confirmed) {
        return;
    }

    try {

        const response =
            await fetch(`/api/leads/${id}`, {
                method: "DELETE",

                headers: {
                    Authorization:
                        `Bearer ${token}`
                }
            });

        const data =
            await response.json();

        if (!response.ok) {

            alert(data.message);

            return;
        }

        alert(
            "Lead deleted successfully!"
        );

        await loadLeads();
        await loadStats();

    } catch (error) {

        console.error(
            "Delete lead error:",
            error
        );

        alert(
            "Failed to delete lead"
        );
    }
}


// Search and filters
function filterLeads() {

    const searchText =
        searchInput.value
            .toLowerCase()
            .trim();

    const selectedStatus =
        statusFilter.value;

    const selectedSource =
        sourceFilter.value;

    const filteredLeads =
        allLeads.filter(lead => {

            const name =
                (lead.name || "")
                    .toLowerCase();

            const email =
                (lead.email || "")
                    .toLowerCase();

            const company =
                (lead.company || "")
                    .toLowerCase();

            const matchesSearch =
                name.includes(searchText) ||
                email.includes(searchText) ||
                company.includes(searchText);

            const matchesStatus =
                selectedStatus === "All" ||
                lead.status === selectedStatus;

            const matchesSource =
                selectedSource === "All" ||
                lead.source === selectedSource;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesSource
            );
        });

    displayLeads(filteredLeads);
}


searchInput.addEventListener(
    "input",
    filterLeads
);


statusFilter.addEventListener(
    "change",
    filterLeads
);


sourceFilter.addEventListener(
    "change",
    filterLeads
);


// Add Lead button
document.getElementById(
    "addLeadBtn"
).addEventListener("click", () => {

    delete leadForm.dataset.editingId;

    leadForm.reset();

    document.getElementById(
        "add-lead"
    ).scrollIntoView({
        behavior: "smooth"
    });
});


// Navigation
document.querySelectorAll(
    ".nav-link"
).forEach(link => {

    link.addEventListener(
        "click",
        () => {

            document.querySelectorAll(
                ".nav-link"
            ).forEach(item => {

                item.classList.remove(
                    "active"
                );

            });

            link.classList.add(
                "active"
            );
        }
    );
});


// Logout
document.getElementById(
    "logoutBtn"
).addEventListener("click", () => {

    localStorage.removeItem(
        "token"
    );

    window.location.href =
        "/login.html";
});


// Load data when page opens
loadStats();
loadLeads();