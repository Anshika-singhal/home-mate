document.addEventListener("DOMContentLoaded", loadDueItems);

async function loadDueItems() {
    const userId = localStorage.getItem("userId");
    const authToken = localStorage.getItem("authToken");

    if (!userId || !authToken) {
        console.error("User ID or Auth token is missing. Redirecting to login page.");
        window.location.href = "./index.html";
        return;
    }

    const DueItemList = document.getElementById('DueItemList');
    if (!DueItemList) {
        console.error("DueItemList element not found in DOM.");
        return;
    }

    // 1️⃣ Load Cached Data First
    const cachedDueItems = localStorage.getItem('cachedDueItems');
    if (cachedDueItems) {
        renderDueItems(JSON.parse(cachedDueItems));
    }

    // 2️⃣ Fetch Fresh Data in Background
    try {
        const categoryResponse = await fetch(`https://home-mate-server-ekkv.onrender.com/api/v1/user/${userId}/category`, {
            headers: { 'Authorization': `Bearer ${authToken}` },
        });

        if (!categoryResponse.ok) {
            console.error("Error fetching categories:", await categoryResponse.text());
            return;
        }

        const categories = await categoryResponse.json();
        const dueItems = [];

        const now = new Date();
        const oneDayInMs = 24 * 60 * 60 * 1000;

        for (const category of categories) {
            const categoryId = category._id;
            const categoryName = category.name;

            const itemResponse = await fetch(`https://home-mate-server-ekkv.onrender.com/api/v1/user/${userId}/category/${categoryId}/item`, {
                headers: { 'Authorization': `Bearer ${authToken}` },
            });

            if (!itemResponse.ok) {
                console.error(`Error fetching items for category ${category.name}:`, await itemResponse.text());
                continue;
            }

            const categoryData = await itemResponse.json();
            const items = categoryData.items || [];

            items.forEach(item => {
                const dueDate = item.serviceDate ? new Date(item.serviceDate) : null;
                const formatDate = new Date(item.serviceDate).toLocaleDateString();

                if (!dueDate || isNaN(dueDate.getTime())) return;

                const leftTime = dueDate - now;

                if (leftTime <= 0 && leftTime <= oneDayInMs && !item.workFinish) {
                    dueItems.push({
                        name: item.name,
                        categoryName: categoryName,
                        dueDate: formatDate,
                        categoryId: categoryId
                    });
                }
            });
        }

        // Update Cache
        localStorage.setItem('cachedDueItems', JSON.stringify(dueItems));

        // Render Fresh Data
        renderDueItems(dueItems);

    } catch (error) {
        console.error("Error fetching due items:", error);
    }
}

// Render Items
function renderDueItems(items) {
    const DueItemList = document.getElementById('DueItemList');
    DueItemList.innerHTML = ''; // Clear previous content

    if (items.length === 0) {
        // Show message if no pending items
        const noItemsMessage = document.createElement('div');
        noItemsMessage.className = 'text-center mt-4';
        noItemsMessage.innerHTML = `<h5 class="text-muted">No pending items</h5>`;
        DueItemList.appendChild(noItemsMessage);
        return;
    }

    items.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'list-group-item d-flex justify-content-between align-items-center';
        itemDiv.innerHTML = `
            <div>
                <h4 class="card-title">${item.name}</h4>
                <h6 class="card-text">Category: ${item.categoryName}</h6>
                <h6 class="card-text">Due Date: ${item.dueDate}</h6>
            </div>`;
        itemDiv.addEventListener('click', () => {
            window.location.href = `./categories.html?categoryId=${item.categoryId}`;
        });
        DueItemList.appendChild(itemDiv);
    });
}
