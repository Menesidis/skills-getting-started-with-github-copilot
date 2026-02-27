document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // build participant list HTML if any
        let participantsHTML = "";
        if (details.participants && details.participants.length) {
          const listItems = details.participants
            .map((p) => `
              <li class="participant-item" data-email="${p}">
                <span class="participant-email">${p}</span>
                <span class="delete-participant" title="Remove participant">&times;</span>
              </li>
            `)
            .join("");
          participantsHTML = `
            <div class="participants-container">
              <p><strong>Participants:</strong></p>
              <ul class="participants-list no-bullets">
                ${listItems}
              </ul>
            </div>
          `;
        }

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          ${participantsHTML}
        `;


        activitiesList.appendChild(activityCard);

        // Add delete event listeners for participants (after card is in DOM)
        if (details.participants && details.participants.length) {
          const participantItems = activityCard.querySelectorAll('.participant-item .delete-participant');
          participantItems.forEach((icon, idx) => {
            icon.addEventListener('click', async (e) => {
              const email = details.participants[idx];
              try {
                const response = await fetch(`/activities/${encodeURIComponent(name)}/signup?email=${encodeURIComponent(email)}`, {
                  method: 'DELETE',
                });
                if (response.ok) {
                  fetchActivities(); // Refresh list
                } else {
                  alert('Failed to remove participant.');
                }
              } catch (err) {
                alert('Error removing participant.');
              }
            });
          });
        }

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        fetchActivities(); // Refresh activities to show new participant
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
