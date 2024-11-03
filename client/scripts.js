document.addEventListener('DOMContentLoaded', function () {
    const categoryMessageElement = document.getElementById("categoryMessage");

    const userData = JSON.parse(localStorage.getItem("userData"));
    // const userId = localStorage.getItem("userId");
    // console.log("User ID from localStorage:", userId); // Debugging line
    // const authToken = localStorage.getItem("authToken");
    // console.log("Auth Token:", authToken); // Add this line to check the token value


    // if (authToken && userData && userId) {
    //     document.getElementById("Welcome").innerText = `Welcome, ${userData.firstName}`;
    //     document.getElementById("Welcomes").innerText = `User ID: ${userId}`; // Use userId here
    // } else {
    //     window.location.href = "./authentication/login-logout.html";
    // }
    // function getAuthToken() {
    //     return localStorage.getItem("authToken");
    // }
    // function getUserId() {
    //     return localStorage.getItem("userId"); // Retrieve userId
    // }

    // Add category form submit
    document.getElementById("CategoryForm").addEventListener("submit", async function (e) {
        e.preventDefault(); // Prevent default form submission

        const CategoryName = document.getElementById("CategoryName").value.trim(); // Trim whitespace
        if (!CategoryName) {
            categoryMessageElement.innerText = "Please enter a category name.";
            return;
        }

        const requestBody = { name: CategoryName };
        // const authToken = getAuthToken();
        // const userId = getUserId();
        const userId = localStorage.getItem("userId");

        try {
            const response = await fetch(`http://localhost:5000/api/v1/admin/user/${userId}/category`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(requestBody)
            });

            const result = await response.json();
            console.log(result);// Log the result for debugging

            if (response.ok) {
                // Create and append the new category to the list
                const newCategory = document.createElement('li');
                newCategory.id = result._id; // Assuming result returns the created category with its id
                newCategory.innerText = result.name;
                newCategory.className = 'list-group-item d-flex justify-content-between align-items-center';
                newCategory.style.cursor = 'pointer'; // Add cursor style for interactivity

                // Create the delete button
                const deleteButton = document.createElement('button');
                deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>'; // Using Font Awesome for the trash icon
                deleteButton.className = 'btn btn-danger btn-sm'; // Bootstrap classes for styling
                deleteButton.style.marginLeft = 'auto'; // Push the button to the right
                deleteButton.onclick = (e) => {
                    e.stopPropagation(); // Prevent event propagation
                    deleteCategorybyID(result._id);
                };

                // Append the delete button and new category to the list
                newCategory.appendChild(deleteButton);
                document.getElementById('CategoryList').appendChild(newCategory);

                // Show success message
                categoryMessageElement.innerText = "Category created successfully!";
                document.getElementById("CategoryForm").reset(); // Reset form fields
                const modal = bootstrap.Modal.getInstance(document.getElementById('exampleModal'));
                if (modal) modal.hide(); // Hide modal if it exists

                // Clear the message after 3 seconds
                setTimeout(() => { categoryMessageElement.innerText = ''; }, 3000);
                fetchCategories(); // Refresh the categories
            }
            else if (response.status === 401) {
                categoryMessageElement.innerText = "Unauthorized please login!!!";
            }
            else {
                categoryMessageElement.innerText = result.message || "Failed to create category.";
            }
        } catch (error) {
            categoryMessageElement.innerText = "Error occurred: " + error.message;
        }
    });

    // Fetch and display categories
    async function fetchCategories() {
        const userId = localStorage.getItem("userId"); // Ensure you retrieve userId here
        const authToken = localStorage.getItem("authToken"); // Fetch authToken here
        console.log("Auth Token:", authToken); // Now this should log the token properly

        // Check if userId and token are present
        if (!userId) {
            console.error("User ID is undefined. Please log in.");
            window.location.href = "./authentication/login-logout.html"; // Redirect to login page if not logged in
            return; // Stop further execution
        }

        if (!authToken) {
            console.error("Auth token is undefined. Please log in.");
            window.location.href = "./authentication/login-logout.html"; // Redirect to login page if not logged in
            return; // Stop further execution
        }
        try {
            const response = await fetch(`http://localhost:5000/api/v1/user/${userId}/category`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            if (!response.ok) {
                const errorText = await response.text(); // Read response as text
                console.error("Error fetching categories:", errorText);
                categoryMessageElement.innerText = errorText; // Display the error message
                return; // Exit if the response is not ok
            }

            // const categories = await response.json(); // Now parse it as JSON if the response is OK

            const Categories = await response.json();
            const CategoryList = document.getElementById('CategoryList');
            CategoryList.innerHTML = ''; // Clear previous list

            // Loop through each category and fetch incomplete item count
            Categories.forEach(category => {
                const newCategory = document.createElement('li');
                newCategory.id = category._id;
                newCategory.className = 'list-group-item d-flex justify-content-between align-items-center';
                newCategory.style.cursor = 'pointer';

                // Incomplete count span (to be populated later)
                const incompleteCountSpan = document.createElement('span');
                incompleteCountSpan.className = 'badge bg-danger rounded-pill'; // Bootstrap badge for styling
                incompleteCountSpan.innerText = 'Loading...'; // Temporary text while fetching count

                // Fetch incomplete item count and update the span
                fetchIncompleteItemCount(category._id).then(incompleteCount => {
                    incompleteCountSpan.innerText = incompleteCount > 0 ? incompleteCount : ''; // Show count only if > 0
                });

                // Category name span
                const categoryNameSpan = document.createElement('span');
                categoryNameSpan.innerText = category.name;

                newCategory.addEventListener('click', () => {
                    window.location.href = `categories.html?categoryId=${category._id}`; // Redirect with category ID
                });

                // Create the delete button
                const deleteButton = document.createElement('button');
                deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>'; // Using Font Awesome for the trash icon
                deleteButton.className = 'btn btn-danger btn-sm'; // Bootstrap classes for styling
                deleteButton.style.marginLeft = 'auto'; // Push the button to the right
                deleteButton.onclick = (e) => {
                    e.stopPropagation(); // Prevent event propagation
                    deleteCategorybyID(category._id);
                };

                // Append the category name, incomplete count, and delete button to the list item
                newCategory.appendChild(incompleteCountSpan); // Display the incomplete item count
                newCategory.appendChild(categoryNameSpan);     // Display the category name next to the count
                newCategory.appendChild(deleteButton);

                // Append the new category to the list
                CategoryList.appendChild(newCategory);
            });
        } catch (error) {
            console.error('Error fetching categories:', error);
            categoryMessageElement.innerText = "An error occurred while fetching categories.";
        }
    }

    // async function fetchCategories() {

    //     try {
    //         const response = await fetch(`http://localhost:5000/api/v1/user/${userId}/category`, {
    //             headers: {
    //                 'Authorization': `Bearer ${authToken}`
    //             }
    //         });

    //         if (!response.ok) {
    //             if (response.status === 401) {
    //                 categoryMessageElement.innerText = "Unauthorized please login!!!";
    //                 //window.location.href = "./authentication/login-logout.html"; // Redirect to login page
    //             } else {
    //                 const errorText = await response.text(); // Get error message as text
    //                 console.error("Error fetching categories:", errorText);
    //                 categoryMessageElement.innerText = "Failed to fetch categories.";
    //             }
    //             return; // Exit if the response is not ok
    //         }

    //         const Categories = await response.json();
    //         const CategoryList = document.getElementById('CategoryList');
    //         CategoryList.innerHTML = ''; // Clear previous list

    //         // Loop through each category and fetch incomplete item count
    //         Categories.forEach(category => {
    //             const newCategory = document.createElement('li');
    //             newCategory.id = category._id;
    //             newCategory.className = 'list-group-item d-flex justify-content-between align-items-center';
    //             newCategory.style.cursor = 'pointer';

    //             // Incomplete count span (to be populated later)
    //             const incompleteCountSpan = document.createElement('span');
    //             incompleteCountSpan.className = 'badge bg-danger rounded-pill'; // Bootstrap badge for styling
    //             incompleteCountSpan.innerText = 'Loading...'; // Temporary text while fetching count

    //             // Fetch incomplete item count and update the span
    //             fetchIncompleteItemCount(category._id).then(incompleteCount => {
    //                 incompleteCountSpan.innerText = incompleteCount > 0 ? incompleteCount : ''; // Show count only if > 0
    //             });

    //             // Category name span
    //             const categoryNameSpan = document.createElement('span');
    //             categoryNameSpan.innerText = category.name;

    //             newCategory.addEventListener('click', () => {
    //                 window.location.href = `categories.html?categoryId=${category._id}`; // Redirect with category ID
    //             });

    //             // Create the delete button
    //             const deleteButton = document.createElement('button');
    //             deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>'; // Using Font Awesome for the trash icon
    //             deleteButton.className = 'btn btn-danger btn-sm'; // Bootstrap classes for styling
    //             deleteButton.style.marginLeft = 'auto'; // Push the button to the right
    //             deleteButton.onclick = (e) => {
    //                 e.stopPropagation(); // Prevent event propagation
    //                 deleteCategorybyID(category._id);
    //             };

    //             // Append the category name, incomplete count, and delete button to the list item
    //             newCategory.appendChild(incompleteCountSpan); // Display the incomplete item count
    //             newCategory.appendChild(categoryNameSpan);     // Display the category name next to the count
    //             newCategory.appendChild(deleteButton);

    //             // Append the new category to the list
    //             CategoryList.appendChild(newCategory);
    //         });
    //     } catch (error) {
    //         console.error('Error fetching categories:', error);
    //         categoryMessageElement.innerText = "An error occurred while fetching categories.";
    //     }
    // }

    // Helper function to fetch incomplete item count for a category
    async function fetchIncompleteItemCount(categoryId) {
        const userId = localStorage.getItem("userId");
        try {
            const response = await fetch(`http://localhost:5000/api/v1/user/${userId}/category/${categoryId}/item`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            if (response.status === 401) {
                categoryMessageElement.innerText = "Unauthorized please login!!!";
            }
            const data = await response.json();

            const items = data.getting.items || [];
            const incompleteItems = items.filter(item => !item.workFinish); // Get only incomplete items
            return incompleteItems.length;
        } catch (error) {
            console.error('Error fetching incomplete item count:', error);
            return 0; // Return 0 if there's an error
        }
    }

    // Call fetchCategories on page load
    fetchCategories();
    // Delete category by ID
    async function deleteCategorybyID(categoryId) {
        if (!confirm("Are you sure you want to delete this category?")) {
            return; // Exit the function if the user cancels
        }

        try {
            const response = await fetch(`http://localhost:5000/api/v1/user/${getUserId()}/category/${categoryId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            if (response.ok) {
                // Remove the category from the UI
                const categoryElement = document.getElementById(categoryId);
                if (categoryElement) categoryElement.remove();

                categoryMessageElement.innerText = 'Category deleted successfully!';
                setTimeout(() => { categoryMessageElement.innerText = ''; }, 3000);
            }
            else if (response.status === 401) {
                categoryMessageElement.innerText = "Unauthorized please login!!!";
            }
            else {
                categoryMessageElement.innerText = 'Failed to delete category.';
            }
        } catch (error) {
            categoryMessageElement.innerText = `Error deleting category: ${error.message}`;
        }
    }
});
