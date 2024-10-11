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

            // Create front of the card
            const flipCardFront = document.createElement('div');
            flipCardFront.className = 'flip-card-front card-header d-flex justify-content-between align-items-center';

            // Front of the card (item name, checkbox, and flip button)
            const cardHeader = document.createElement('div');
            cardHeader.className = 'card-header d-flex justify-content-between align-items-center';

            // Checkbox for item completion
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = item.workFinish; // Set checkbox based on item's finish status
            checkbox.addEventListener('change', async function () {
                if (this.checked) {
                    const isConfirmed = confirm("Have you completed this task?");
                    if (isConfirmed) {
                        await toggleCheckBox(categoryId, item._id);
                    } else {
                        checkbox.checked = false; // Revert checkbox state if canceled
                    }
                } else {
                    const isConfirmed = confirm("Are you sure you want to uncheck this checkbox?");
                    if (isConfirmed) {
                        await toggleCheckBox(categoryId, item._id);
                    } else {
                        checkbox.checked = true; // Revert checkbox state if canceled
                    }
                }
                // Update the incomplete count display
                document.getElementById(`incomplete-count-${categoryId}`).textContent = incompleteItemCount;
            });

            // Create a wrapper for centering the item name
            const nameWrapper = document.createElement('div');
            nameWrapper.className = 'w-100 text-center d-flex'; // This ensures the item name is centered

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

            // Append checkbox, nameWrapper, and flip button to card header
            cardHeader.appendChild(checkbox);
            cardHeader.appendChild(nameWrapper);
            cardHeader.appendChild(flipButton);

            // Back of the card (includes item description and delete button)
            const flipCardBack = document.createElement('div');
            flipCardBack.className = 'flip-card-back card-body';

            const description = document.createElement('p');
            description.innerText = `Description: ${item.description || 'No description available'}`;

            const instructions = document.createElement('p');
            instructions.innerText = `Instructions: ${item.instructions || 'No instructions available'}`;

            // Delete button
            const deleteButton = document.createElement('button');
            deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>'; // Font Awesome trash icon
            deleteButton.className = 'btn btn-danger btn-sm';
            deleteButton.onclick = (e) => {
                e.stopPropagation(); // Prevent event propagation
                deleteItemFromCategory(categoryId, item._id);
            };

            // Append description, instructions, and delete button to flipCardBack
            flipCardBack.appendChild(description);
            flipCardBack.appendChild(instructions);
            flipCardBack.appendChild(deleteButton); // Add delete button to the back of the card

            flipCardInner.appendChild(flipCardFront); // Front of the card
            flipCardInner.appendChild(flipCardBack); // Back of the card

            card.appendChild(flipCardInner);
            categoryContainer.appendChild(card);
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

// Function to add an item to the category
async function addItemToCategory(categoryId) {
    const itemNameInput = document.getElementById('ItemName');
    const itemDescriptionInput = document.getElementById('ItemDescription');
    const itemInstructionInput = document.getElementById('ItemInstruction');
    const responseMessage = document.getElementById('ResponseMessage');
    const itemFormContainer = document.getElementById('itemFormContainer'); // To hide the form later


    // Check if the input elements exist
    if (!itemNameInput || !itemDescriptionInput || !itemInstructionInput) {
        responseMessage.innerText = "Input fields are not found. Please check your HTML.";
        return;
    }

    const itemName = itemNameInput.value;
    const itemDescription = itemDescriptionInput.value;
    const itemInstruction = itemInstructionInput.value;

    if (!itemName) {
        responseMessage.innerText = "Please enter an Item Name to add to the category";
        return;
    }

    const requiredData = { name: itemName,
         description: itemDescription,
          instructions: itemInstruction, 
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
            method: 'PUT'
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
