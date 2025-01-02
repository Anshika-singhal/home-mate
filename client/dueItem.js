document.addEventListener("DOMContentLoaded", fetchCategoryDueItem);

async function fetchCategoryDueItem() {
    const userId = localStorage.getItem("userId");
    const authToken = localStorage.getItem("authToken");

    if (!userId || !authToken) {
        console.error("User ID or Auth token is missing. Redirecting to login page.");
        window.location.href = "./index.html";
        return;
    }

    try {
        const categoryResponse = await fetch(`https://home-mate-server-ekkv.onrender.com/api/v1/user/${userId}/category`, {
            headers: { 'Authorization': `Bearer ${authToken}` },
        });

        if (!categoryResponse.ok) {
            console.error("Error fetching categories:", await categoryResponse.text());
            return;
        }

        const categories = await categoryResponse.json();
        const DueItemList = document.getElementById('DueItemList');
        if (!DueItemList) {
            console.error("DueItemList element not found in DOM.");
            return;
        }
        DueItemList.innerHTML = '';

        const now = new Date();
        const oneDayInMs = 24 * 60 * 60 * 1000;

        for (const category of categories) {
            const categoryId = category._id;
            const categoryName = category.name

            const itemResponse = await fetch(`https://home-mate-server-ekkv.onrender.com/api/v1/user/${userId}/category/${categoryId}/item`, {
                headers: { 'Authorization': `Bearer ${authToken}` },
            });

            if (!itemResponse.ok) {
                console.error(`Error (${itemResponse.status}) fetching items for category ${category.name}:`, await itemResponse.text());
                continue;
            }

            const categoryData = await itemResponse.json();
            const items = categoryData.items || []; 

            items.forEach(item => {
                const dueDate = item.serviceDate ? new Date(item.serviceDate) : null;
                const formatDate = new Date(item.serviceDate).toLocaleDateString();
                if (!dueDate || isNaN(dueDate.getTime())) {
                    console.warn(`Invalid serviceDate for item ${item.name}:`, item.serviceDate);
                    return;
                }

                const leftTime = dueDate - now;

                if (leftTime <= 0 && leftTime <= oneDayInMs && !item.workFinish) {
                    const itemDiv = document.createElement('div');
                    itemDiv.className = 'list-group-item d-flex justify-content-between align-items-center';

                    itemDiv.innerHTML = `
                        <div class="col md-4">
                            <h4 class="card-title">${item.name}</h4>
                            <h6 class="card-text">Category: ${categoryName}</h6>
                            <h6 class="card-text">Due Date: ${formatDate}</h6>
                        </div>`;
                    DueItemList.appendChild(itemDiv);
                }
            });
        }
    } catch (error) {
        console.error("Error fetching due items:", error);
    }
}
