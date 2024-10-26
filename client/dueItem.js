async function fetchCategoryDueItem() {
    try {
        const categoryResponse = await fetch(`http://localhost:5000/api/v1/categories`);
        const Categories = await categoryResponse.json();
        const DueItemList = document.getElementById('DueItemList');
        DueItemList.innerHTML = ''; // Clear previous list
        const now = new Date();
        const oneDayInMs = 24 * 60 * 60 * 1000;
        for (const category of Categories) {
            const categoryId = category._id;
            const response = await fetch(`http://localhost:5000/api/v1/categories/${categoryId}/items`);
            const categoryData = await response.json();
            // Check if categoryData.items exists and is an array
            if (!categoryData.getting.items || !Array.isArray(categoryData.getting.items) || !categoryData) {
                console.error(`Invalid or missing items for category ${category.name}`);
                continue; // Skip to the next category if items are not valid
            }
            const items = categoryData.getting.items;
            if (items.length === 0) {
                continue;
            }
            items.forEach(item => {
                const dueDate = new Date(item.serviceDate);
                const leftTime = dueDate - now;
                if ((leftTime > 0 && leftTime<1) || leftTime <= oneDayInMs &&item. workFinish==false) {
                    const itemDiv = document.createElement('div');
                    itemDiv.className = 'list-group-item d-flex justify-content-between align-items-center';
                    itemDiv.innerHTML = `<div class="col md-4">
                    <h4 class="card title">Name:${item.name}</h4>
                    <p class="card text">Description:${item.description || 'No Description' }</p>
                    <h6 class="card text">Due Date:${item.serviceDate}</h6>
                    </div>`;
                    DueItemList.appendChild(itemDiv);
                }
            });
        }
    }
    catch (error) {
        console.error("Item Fetching due to time",error);
    }
}
fetchCategoryDueItem();