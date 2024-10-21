// Fetch category items when the page loads
document.addEventListener('DOMContentLoaded', function () {
    const params = new URLSearchParams(window.location.search);
    const categoryId = params.get('categoryId');

    if (!categoryId) {
        document.getElementById("categoryContainer").innerText = "No category ID found in the URL.";
        return; // Stop further execution if no category ID is found
    }

    // Fetch and display items for the category
    fetchCategoryItems(categoryId);

    // Handle item form submission
    document.getElementById('ItemForm').addEventListener('submit', function (event) {
        event.preventDefault();
        console.log("Form submitted!"); // Log to check if event is firing
        addItemToCategory(categoryId); // Use the fetched categoryId from URL
    });

    // Toggle item form visibility when plus button is clicked
    const showFormButton = document.getElementById('showFormButton');
    const itemFormContainer = document.getElementById('itemFormContainer');
    const cancelButton = document.getElementById('cancelButton');

    showFormButton.addEventListener('click', function () {
        itemFormContainer.style.display = 'block'; // Show the form
    });

    cancelButton.addEventListener('click', function () {
        itemFormContainer.style.display = 'none'; // Hide the form
    });
});

async function fetchCategoryItems(categoryId) {
    try {
        const response = await fetch(`http://localhost:5000/api/v1/categories/${categoryId}/items`);
        const data = await response.json();

        if (!data || !data.getting) {
            document.getElementById("categoryContainer").innerText = "No such category found.";
            return;
        }

        // Display category name in navbar
        document.getElementById('categoryName').textContent = data.getting.name;

        const items = data.getting.items;
        const categoryContainer = document.getElementById('categoryContainer');
        categoryContainer.innerHTML = ''; // Clear previous content

        let incompleteItemCount = 0;  // Track incomplete items

        if (items.length === 0) {
            categoryContainer.innerText = "No items found in this category.";
            return;
        }

        items.forEach(item => {
            if (!item.name.trim()) {
                return; // Skip creating card if item name is empty
            }

            if (!item.workFinish) {
                incompleteItemCount++;  // Increment if the item is not finished
            }

            // Create card container for flipping
            const card = document.createElement('div');
            card.className = 'flip-card mb-3'; // Add flip-card class

            const flipCardInner = document.createElement('div');
            flipCardInner.className = 'flip-card-inner'; // Add flip-card-inner class

            // Front of the card (includes header and item details)
            const flipCardFront = document.createElement('div');
            flipCardFront.className = 'flip-card-front';
            flipCardFront.style.backgroundColor = '#e3c9b8'; // Set background color here

            // Front of the card (includes header and item details)
            const cardHeader = document.createElement('div');
            cardHeader.className = 'card-header d-flex align-items-center'; // Keep d-flex for flex properties
            cardHeader.style.backgroundColor = '#bfa284'; // Match your front color
            cardHeader.style.color = '#333'; // Dark text
            cardHeader.style.justifyContent = 'space-between'; // Space elements out

            // Checkbox for item completion
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = item.workFinish; // Set checkbox based on item's finish status
            checkbox.addEventListener('change', async function () {
                if (this.checked) {
                    const isConfirmed = confirm("Have you completed this task?");
                    if (isConfirmed) {
                        await toggleCheckBox(categoryId, item._id);
                        await updateDate(categoryId, item._id);
                        const frequency = item.frequency || 'weekly'; // Default to 'daily' if frequency is not defined
                        await dateUpdateNext(categoryId, item._id, frequency);
                    } else {
                        checkbox.checked = false; // Revert checkbox state if canceled
                    }
                } else {
                    const isConfirmed = confirm("Are you sure you want to uncheck this checkbox?");
                    if (isConfirmed) {
                        await toggleCheckBox(categoryId, item._id);
                        await updateDate(categoryId, item._id);
                    } else {
                        checkbox.checked = true; // Revert checkbox state if canceled
                    }
                }
                // Update the incomplete count display
                document.getElementById(`incomplete-count-${categoryId}`).textContent = incompleteItemCount;
            });

            const nameWrapper = document.createElement('div');
            nameWrapper.className = 'flex-grow-1 text-center'; // Center item name and grow to take space

            const itemName = document.createElement('span');
            itemName.innerText = item.name;
            itemName.className = 'fw-bold';

            nameWrapper.appendChild(itemName);

            // Flip button to trigger the card flip
            const flipButton = document.createElement('button');
            flipButton.innerText = 'Flip';
            flipButton.className = 'btn btn-secondary btn-sm';
            flipButton.onclick = () => {
                flipCardInner.classList.toggle('flipped'); // Toggle 'flipped' class on click
            };

            // Append elements to cardHeader
            cardHeader.appendChild(checkbox);
            cardHeader.appendChild(nameWrapper);
            cardHeader.appendChild(flipButton);

            flipCardFront.appendChild(cardHeader);

            // Back of the card
            const flipCardBack = document.createElement('div');
            flipCardBack.className = 'flip-card-back card-body';
            flipCardBack.style.backgroundColor = '#bfa284'; // Consistent with the back color
            flipCardBack.style.color = '#ffffff'; // White text

            const description = document.createElement('p');
            description.innerText = `Description: ${item.description || 'No description available'}`;

            const instructions = document.createElement('p');
            instructions.innerText = `Instructions: ${item.instructions || 'No instructions available'}`;

            // Flip Back button to flip the card back to the front (aligned left)
            const flipBackButton = document.createElement('button');
            flipBackButton.innerText = 'Flip Back';
            flipBackButton.className = 'btn btn-secondary btn-sm';

            // Flip back on button click
            flipBackButton.onclick = () => {
                flipCardInner.classList.toggle('flipped'); // Toggle 'flipped' class to return to the front
            };

            // Delete button (aligned right)
            const deleteButton = document.createElement('button');
            deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>'; // Font Awesome trash icon
            deleteButton.className = 'btn btn-danger btn-sm';
            deleteButton.onclick = (e) => {
                e.stopPropagation(); // Prevent event propagation
                deleteItemFromCategory(categoryId, item._id);
            };

            flipCardBack.appendChild(description);
            flipCardBack.appendChild(instructions);
            flipCardBack.appendChild(deleteButton);
            flipCardBack.appendChild(flipBackButton);

            flipCardInner.appendChild(flipCardFront);
            flipCardInner.appendChild(flipCardBack);
            card.appendChild(flipCardInner);

            categoryContainer.appendChild(card); // Append card to the category container
        });

        // Add incomplete items count next to the delete button
        const incompleteCountWrapper = document.createElement('div');
        incompleteCountWrapper.className = 'incomplete-count-wrapper'; // Add a class to control visibility
        incompleteCountWrapper.style.display = 'none'; // Hide it by default

        const incompleteCountDisplay = document.createElement('span');
        incompleteCountDisplay.id = `incomplete-count-${categoryId}`;
        incompleteCountDisplay.textContent = `Incomplete Items: ${incompleteItemCount}`;
        incompleteCountWrapper.appendChild(incompleteCountDisplay);

        categoryContainer.appendChild(incompleteCountWrapper); // Append it to the container

        // Check if the current page is the home page (adjust based on your file structure)
        if (window.location.pathname.includes('Home.html')) {
            incompleteCountWrapper.style.display = 'block'; // Show the incomplete count on the home page
        }

    } catch (error) {
        document.getElementById("categoryContainer").innerText = `Error fetching category items: ${error.message}`;
    }
}

flatpickr("#ItemServiceDate", {
    altInput: true,
    altFormat: "F j, Y",
    dateFormat: "Y-m-d",
    minDate: "today",
})
// Function to add an item to the category
async function addItemToCategory(categoryId) {
    const itemNameInput = document.getElementById('ItemName');
    const itemDescriptionInput = document.getElementById('ItemDescription');
    const itemInstructionInput = document.getElementById('ItemInstruction');
    const frequencyInput = document.getElementById('ItemFrequency');
    const serviceDateInput = document.getElementById('ItemServiceDate');
    const responseMessage = document.getElementById('ResponseMessage');
    const itemFormContainer = document.getElementById('itemFormContainer'); // To hide the form later


    // Check if the input elements exist
    if (!itemNameInput || !itemDescriptionInput || !itemInstructionInput || !frequencyInput || !serviceDateInput) {
        responseMessage.innerText = "Input fields are not found. Please check your HTML.";
        return;
    }

    const itemName = itemNameInput.value;
    const itemDescription = itemDescriptionInput.value;
    const itemInstruction = itemInstructionInput.value;
    const Frequency = frequencyInput.value;
    const ServiceDate = serviceDateInput.value;

    if (!itemName || !Frequency || !ServiceDate) {
        responseMessage.innerText = "Please enter the required fields to add to the category";
        return;
    }

    const requiredData = {
        name: itemName,
        description: itemDescription,
        instructions: itemInstruction,
        frequency: Frequency,
        serviceDate: ServiceDate
    };

    try {
        const response = await fetch(`http://localhost:5000/api/v1/categories/${categoryId}/items`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requiredData)
        });

        console.log(response); // Add this to inspect the response object


        if (response.ok) {
            responseMessage.innerText = "Item Added Successfully!";

            // Clear input fields after successful addition
            itemNameInput.value = '';
            itemDescriptionInput.value = '';
            itemInstructionInput.value = '';
            frequencyInput.value = '';
            serviceDateInput.value = '';

            // Hide the form immediately
            itemFormContainer.style.display = 'none';

            // Hide the message after 3 seconds
            setTimeout(() => {
                responseMessage.innerText = '';
            }, 3000);

            // Optionally, you can refresh the list after adding a new item
            fetchCategoryItems(categoryId);
        } else {
            const errorData = await response.json();
            responseMessage.innerText = `Error: ${errorData.message}`;
        }
    } catch (error) {
        console.error("Error Adding Item:", error);
        responseMessage.innerText = `Item Not Added: ${error.message}`;
    }
}

// Function to toggle item checkbox (update item status)
async function toggleCheckBox(categoryId, itemId) {
    try {
        const response = await fetch(`http://localhost:5000/api/v1/categories/${categoryId}/items/${itemId}`, {
            method: 'PUT',
        });
        if (!response.ok) {
            throw new Error("Cannot update the item status!");
        }
    } catch (error) {
        console.error(`Error updating item status: ${error.message}`);
    }
}

// Function to delete item from category
async function deleteItemFromCategory(categoryId, itemId) {
    if (!confirm("Are you sure you want to delete this item?")) {
        return; // Exit the function if the user cancels
    }
    try {
        const response = await fetch(`http://localhost:5000/api/v1/categories/${categoryId}/item/${itemId}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error("Cannot delete the item!");
        }

        // Fetch and update category items after successful deletion
        fetchCategoryItems(categoryId);
    } catch (error) {
        console.error(`Error deleting item: ${error.message}`);
    }
}

//Function to add lastServiced date in database
async function updateDate(categoryId, itemId) {
    try {
        const response = await fetch(`http://localhost:5000/api/v1/categories/${categoryId}/items/${itemId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ lastServiced: new Date().toString() }),
        });
        if (!response.ok) {
            throw new Error("Cannot update the item status!");
        }
    } catch (error) {
        console.error(`Error updating item status: ${error.message}`);
    }
}
//undone work

async function dateUpdateNext(categoryId, itemId, frequency) {
    try {
        const response = await fetch(`http://localhost:5000/api/v1/categories/${categoryId}/item/${itemId}`);
        
        // Check if the response is ok before parsing
        if (!response.ok) {
            throw new Error("Failed to fetch item data");
        }

        const itemData = await response.json();
        console.log(itemData);

        // Check if the item has a valid service date
        if (!itemData.serviceDate) {
            console.log("Error: serviceDate is missing.");
            return;
        }

        // Check if the item is marked as finished
        if (!itemData.workFinish) {
            console.log("Error: Item is not marked as finished.");
            return;
        }

        const lastServiceDate = new Date(itemData.serviceDate);
        
        // Validate lastServiceDate
        if (isNaN(lastServiceDate.getTime())) {
            console.log("Error: Invalid service date format.");
            return;
        }

        const oneDayInMs = 24 * 60 * 60 * 1000;
        let nextServiceDate;

        // Calculate the next service date based on frequency
        switch (frequency) {
            case 'daily':
                nextServiceDate = new Date(lastServiceDate.getTime() + oneDayInMs);
                break;
            case 'weekly':
                nextServiceDate = new Date(lastServiceDate.getTime() + oneDayInMs * 7);
                break;
            case 'monthly':
                nextServiceDate = new Date(lastServiceDate.setMonth(lastServiceDate.getMonth() + 1));
                break;
            case 'yearly':
                nextServiceDate = new Date(lastServiceDate.setFullYear(lastServiceDate.getFullYear() + 1));
                break;
            default:
                console.log("Invalid frequency selected");
                return;
        }

        // Prepare the update for the next service date
        const updateDate = { serviceDate: nextServiceDate.toISOString() };

        // Send the PATCH request to update the next service date
        const updateResponse = await fetch(`http://localhost:5000/api/v1/categories/${categoryId}/item/${itemId}`, {
            method: "PATCH",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateDate),
        });

        // Check if the update response is ok
        if (!updateResponse.ok) {
            throw new Error("Failed to update next service date");
        }

        console.log(`Updated service date for item ${itemId} to ${nextServiceDate.toLocaleDateString()}`);
    } catch (error) {
        console.error(`Error updating next service date: ${error.message}`);
    }
}
