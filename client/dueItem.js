async function fetchCategoryDueItem(categoryId) {
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
            const items = categoryData.items;
            if (items.length === 0) {
                continue;
            }
            items.forEach(item => {
                const dueDate = new Date(item.serviceDate);
                const leftTime = dueDate - now;
                if (leftTime > 0 && leftTime <= oneDayInMs) {
                    const itemDiv = document.createElement('div');
                    itemDiv.className = '';
                    itemDiv.innerHTML = `
                    <h4>Name:${item.name}</h4>
                    <p>Description:${item.description || 'No Description' }</p>
                    <h6>Due Date:${item.serviceDate}</h6>
                    `;
                    DueItemList.appendChild(itemDiv);
                    console.log(`${item.name}`);
                }
            });
        }
    }
    catch (error) {
        console.error("Item Fetching due to time",error);
    }
}
fetchCategoryDueItem();