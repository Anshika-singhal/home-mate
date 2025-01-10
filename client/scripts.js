document.addEventListener('DOMContentLoaded', function () {
    // Add event listener for the logout button
    async function logoutUser() {
        const userId = localStorage.getItem("userId");
        const authToken = localStorage.getItem("authToken");

        if (!authToken || !userId) {
            categoryMessageElement.innerText = "Unauthorized, please login.";
            return;
        }
        try {
            const response = await fetch('https://home-mate-server-ekkv.onrender.com/api/logout', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            if (response.ok) {
                Swal.fire({
                    title: "Logout successful"
                });
                // Clear user data from local storage
                localStorage.clear();

                // Redirect to the login page
                window.location.href = "./index.html";
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Logout Failed",
                    text: "Please try again.",
                });
            }
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: error.message,
            });
        }
    }
    document.getElementById('logoutButton').addEventListener('click', logoutUser);

    document.getElementById("CategoryForm").addEventListener("submit", async function (e) {
        e.preventDefault();
        const categoryMessageElement = document.getElementById("CategoryMessage");
        const CategoryName = document.getElementById("CategoryName").value.trim();

        if (!CategoryName) {
            displayErrorMessage("Please enter a category name.");
            return;
        }

        const requestBody = { name: CategoryName };
        const userId = localStorage.getItem("userId");
        const authToken = localStorage.getItem("authToken");

        try {
            const response = await fetch(`https://home-mate-server-ekkv.onrender.com/api/v1/admin/user/${userId}/category`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(requestBody)
            });

            const result = await response.json();

            if (response.ok) {
                // Handle recovery case
                if (result.category?.isDeleted) {
                    handleRecoveryOption(result.category._id);
                    return;
                }

                // Success case
                displaySuccessMessage(result.message || "Category created successfully!");
                document.getElementById("CategoryForm").reset();
                fetchCategories();
            } else {
                // Handle errors
                displayErrorMessage(result.message || "Failed to create category.");
            }
        } catch (error) {
            displayErrorMessage("An error occurred: " + error.message);
        }
    });

    // Handles recovery modal option using Swal.fire
    function handleRecoveryOption(categoryId) {
        console.log("Initiating recovery for category ID:", categoryId);

        Swal.fire({
            title: 'Deleted Category Detected',
            text: 'A deleted category with this name exists. Do you want to recover it or create a new one?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Recover Category',
            cancelButtonText: 'Create New',
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                // User clicked 'Recover Category'
                recoverCategory(categoryId)
                    .then(() => {
                        Swal.fire({
                            icon: 'success',
                            title: 'Recovered!',
                            text: 'The category has been successfully recovered.',
                            timer: 3000, // Display for 3 seconds
                            timerProgressBar: true,
                            showConfirmButton: false // Hides the "OK" button
                        });
                        fetchCategories(); // Reload categories
                    })
                    .catch((error) => {
                        console.error('Recovery failed:', error);
                        Swal.fire('Error!', 'Failed to recover the category.', 'error');
                    });
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                // User clicked 'Create New'
                createNewCategory(categoryId)
                    .then(() => {
                        Swal.fire('Created!', 'A new category has been created.', 'success');
                        fetchCategories(); // Reload categories
                    })
                    .catch((error) => {
                        console.error('Creation failed:', error);
                        Swal.fire('Error!', 'Failed to create a new category.', 'error');
                    });
            }
        });
    }

    // Recover category function
    async function recoverCategory(categoryId) {
        const userId = localStorage.getItem("userId");
        const authToken = localStorage.getItem("authToken");
        console.log("Recovering category with ID:", categoryId);

        try {
            const response = await fetch(
                `https://home-mate-server-ekkv.onrender.com/api/v1/user/${userId}/category/${categoryId}/recover`,
                {
                    method: "PATCH",
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    }
                }
            );

            if (response.ok) {
                // displaySuccessMessage("Category recovered successfully!");
                fetchCategories(); // Ensure the categories are updated
            } else {
                const errorData = await response.json();
                displayErrorMessage(errorData?.message || "Failed to recover category.");
            }
        } catch (error) {
            displayErrorMessage("Error: " + error.message);
        }
    }

    // Create a new category function
    async function createNewCategory(baseCategoryId) {
        const userId = localStorage.getItem("userId");
        const authToken = localStorage.getItem("authToken");

        try {
            const response = await fetch(
                `https://home-mate-server-ekkv.onrender.com/api/v1/admin/user/${userId}/category`,
                {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify({ name: `${baseCategoryId}_new` })
                }
            );

            if (response.ok) {
                displaySuccessMessage("New category created successfully!");
                fetchCategories(); // Ensure the categories are updated
            } else {
                displayErrorMessage("Failed to create a new category.");
            }
        } catch (error) {
            displayErrorMessage("Error occurred: " + error.message);
        }
    }

    // Utility to display error messages
    function displayErrorMessage(message) {
        const msgElement = document.getElementById("CategoryMessage");
        msgElement.innerText = message;
        msgElement.classList.add("text-danger");
        msgElement.classList.remove("text-success");
    }

    // Utility to display success messages
    function displaySuccessMessage(message) {
        const msgElement = document.getElementById("CategoryMessage");
        msgElement.innerText = message;
        msgElement.classList.add("text-success");
        msgElement.classList.remove("text-danger");
    }

    // Simulating the category fetching function to populate and refresh category list if necessary

    // Fetch and display categories
    async function fetchCategories() {
        const userId = localStorage.getItem("userId");
        const authToken = localStorage.getItem("authToken");

        if (!userId || !authToken) {
            console.error("User ID or auth token is undefined. Redirecting to login.");
            window.location.href = "./index.html";
            return;
        }

        try {
            const response = await fetch(`https://home-mate-server-ekkv.onrender.com/api/v1/user/${userId}/category`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });

            if (!response.ok) {
                const errorText = await response.text();
                categoryMessageElement.innerText = errorText;
                return;
            }

            const categories = await response.json();
            const CategoryList = document.getElementById('CategoryList');
            CategoryList.innerHTML = '';

            categories.forEach(category => {
                const newCategory = document.createElement('li');
                newCategory.id = category._id;
                newCategory.className = 'list-group-item d-flex justify-content-between align-items-center';
                newCategory.style.cursor = 'pointer';

                // Container for count and name
                const countAndNameContainer = document.createElement('div');
                countAndNameContainer.className = 'd-flex align-items-center';

                // Create badge for incomplete item count
                const incompleteCountSpan = document.createElement('span');
                incompleteCountSpan.className = 'badge bg-danger rounded-pill me-2';
                incompleteCountSpan.innerText = 'Loading...';

                // Fetch and display incomplete item count
                fetchIncompleteItemCount(category._id).then(incompleteCount => {
                    incompleteCountSpan.innerText = incompleteCount > 0 ? incompleteCount : '';
                });

                // Create span for category name
                const categoryNameSpan = document.createElement('span');
                categoryNameSpan.innerText = category.name;

                // Add count and name to the container
                countAndNameContainer.appendChild(incompleteCountSpan); // Incomplete item count
                countAndNameContainer.appendChild(categoryNameSpan);     // Category name

                // Set click event to navigate to category page
                newCategory.addEventListener('click', () => {
                    window.location.href = `categories.html?categoryId=${category._id}`;
                });

                // Delete button
                const deleteButton = document.createElement('button');
                deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
                deleteButton.className = 'btn btn-danger btn-sm';
                deleteButton.onclick = (e) => {
                    e.stopPropagation();
                    deleteCategorybyID(category._id);
                };

                // Append elements in the correct order
                newCategory.appendChild(countAndNameContainer); // Left-aligned count and name
                newCategory.appendChild(deleteButton);          // Right-aligned delete button

                CategoryList.appendChild(newCategory);
            });
            setTimeout(() => { categoryMessageElement.innerText = ''; }, 3000);
        } catch (error) {
            console.error('Error fetching categories:', error);
            categoryMessageElement.innerText = "An error occurred while fetching categories.";
            setTimeout(() => { categoryMessageElement.innerText = ''; }, 3000);
        }
    }

    // Helper function to fetch incomplete item count for a category
    async function fetchIncompleteItemCount(categoryId) {
        const userId = localStorage.getItem("userId");
        const authToken = localStorage.getItem("authToken");

        if (!userId || !authToken) {
            console.error("User ID or auth token is missing.");
            return 0;
        }

        try {
            const response = await fetch(`https://home-mate-server-ekkv.onrender.com/api/v1/user/${userId}/category/${categoryId}/item`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });

            if (!response.ok) {
                categoryMessageElement.innerText = "Unauthorized, please login!";
                return 0;
            }

            const data = await response.json();
            const items = data.items || [];
            const incompleteItems = items.filter(item => !item.workFinish);
            return incompleteItems.length;
        } catch (error) {
            console.error('Error fetching incomplete item count:', error);
            return 0;
        }
    }

    // Delete category by ID
    async function deleteCategorybyID(categoryId) {
        // Replace confirm dialog with SweetAlert and include an input field
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'Type "DELETE" to confirm the deletion of this category.',
            icon: 'warning',
            input: 'text', // Input field to type "DELETE"
            inputPlaceholder: 'Type "DELETE" to confirm',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, keep it',
            reverseButtons: true
        });

        // Check if the user confirmed the action and typed "DELETE"
        if (!result.isConfirmed || result.value.toLowerCase() !== 'delete') {
            if (result.isDismissed) {
                categoryMessageElement.innerText = 'Category deletion canceled.';
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'You must type "DELETE" to confirm.',
                });
            }
            return; // Exit the function if the user cancels or does not type "DELETE"
        }

        const userId = localStorage.getItem("userId");
        const authToken = localStorage.getItem("authToken");

        if (!userId || !authToken) {
            console.error("User ID or auth token is undefined. Redirecting to login.");
            window.location.href = "./index.html";
            return;
        }

        try {
            const response = await fetch(`https://home-mate-server-ekkv.onrender.com/api/v1/user/${userId}/category/${categoryId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${authToken}` }
            });

            if (response.ok) {
                const categoryElement = document.getElementById(categoryId);
                if (categoryElement) categoryElement.remove();
                categoryMessageElement.innerText = 'Category deleted successfully!';
                setTimeout(() => { categoryMessageElement.innerText = ''; }, 3000);
            } else {
                categoryMessageElement.innerText = 'Failed to delete category.';
            }
            setTimeout(() => { categoryMessageElement.innerText = ''; }, 3000);
        } catch (error) {
            categoryMessageElement.innerText = `Error deleting category: ${error.message}`;
            setTimeout(() => { categoryMessageElement.innerText = ''; }, 3000);
        }
    }

    fetchCategories();
});
