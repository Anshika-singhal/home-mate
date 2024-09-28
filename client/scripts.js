document.addEventListener('DOMContentLoaded', function () {
    const categoryMessageElement = document.getElementById("categoryMessage");

    // Redirect to categories.html when the "Categories" header is clicked
    const categoriesHeader = document.getElementById('categoriesHeader');
    categoriesHeader.addEventListener('click', () => {
        window.location.href = 'categories.html';
    });

    // Change color on hover
    categoriesHeader.addEventListener('mouseenter', () => {
        categoriesHeader.style.color = '#6a4e4d'; // Darker shade on hover
    });

    categoriesHeader.addEventListener('mouseleave', () => {
        categoriesHeader.style.color = '#8b5e3c'; // Original color
    });

    // Add category form submit
    document.getElementById("CategoryForm").addEventListener("submit", async function (e) {
        e.preventDefault(); // Prevent default form submission

        const CategoryName = document.getElementById("CategoryName").value.trim(); // Trim whitespace
        if (!CategoryName) {
            categoryMessageElement.innerText = "Please enter a category name.";
            return;
        }

        const requestBody = { name: CategoryName };

        try {
            const response = await fetch("http://localhost:5000/api/v1/admin/categories", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            const result = await response.json();
            console.log(result); // Log the result for debugging

            if (response.ok) {
                // Create and append the new category to the list
                const newCategory = document.createElement('li');
                newCategory.id = result._id; // Assuming result returns the created category with its id
                newCategory.innerText = result.name;
                newCategory.className = 'list-group-item d-flex justify-content-between align-items-center';
                newCategory.style.cursor = 'pointer'; // Add cursor style for interactivity

                // Add click event to redirect to categories.html with the category ID
                newCategory.addEventListener('click', () => {
                    window.location.href = `categories.html?categoryId=${result._id}`; // Redirect with category ID
                });

                // Create the delete button
                const deleteButton = document.createElement('button');
                deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>'; // Using Font Awesome for the trash icon
                deleteButton.className = 'btn btn-danger btn-sm'; // Bootstrap classes for styling
                deleteButton.style.marginLeft = 'auto'; // Push the button to the right
                deleteButton.onclick = () => {
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
            } else {
                categoryMessageElement.innerText = result.message || "Failed to create category.";
            }
        } catch (error) {
            categoryMessageElement.innerText = "Error occurred: " + error.message;
        }
    });

    // Fetch and display categories
    async function fetchCategories() {
        try {
            const response = await fetch('http://localhost:5000/api/v1/categories');
            const Categories = await response.json();
            const CategoryList = document.getElementById('CategoryList');
            CategoryList.innerHTML = ''; // Clear previous list

            Categories.forEach(category => {
                const newCategory = document.createElement('li');
                newCategory.id = category._id;
                newCategory.innerText = category.name;
                newCategory.className = 'list-group-item d-flex justify-content-between align-items-center';
                newCategory.style.cursor = 'pointer';

                newCategory.addEventListener('click', () => {
                    window.location.href = `categories.html?categoryId=${category._id}`; // Redirect with category ID
                });

                // Create the delete button
                const deleteButton = document.createElement('button');
                deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>'; // Using Font Awesome for the trash icon
                deleteButton.className = 'btn btn-danger btn-sm'; // Bootstrap classes for styling
                deleteButton.style.marginLeft = 'auto'; // Push the button to the right
                deleteButton.onclick = () => {
                    deleteCategorybyID(category._id);
                };

                // Append the delete button and new category to the list
                newCategory.appendChild(deleteButton);
                CategoryList.appendChild(newCategory);
            });
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    }

    // Call fetchCategories on page load
    fetchCategories();
});

