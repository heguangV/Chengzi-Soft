document.addEventListener("DOMContentLoaded", () => {
    const favoriteBtn = document.querySelector(".favorite-btn");

    if (!favoriteBtn) return;

    const movie = {
        title: favoriteBtn.dataset.title,
        img: favoriteBtn.dataset.img,
        link: favoriteBtn.dataset.link
    };

    // 安全获取 localStorage
    let favorites = [];
    try {
        favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    } catch(e) {
        favorites = [];
    }

    // 更新按钮状态
    const isFavorite = favorites.some(fav => fav.title === movie.title);
    updateButton(isFavorite);

    favoriteBtn.addEventListener("click", () => {
        let favorites = [];
        try {
            favorites = JSON.parse(localStorage.getItem("favorites")) || [];
        } catch(e) {
            favorites = [];
        }

        const index = favorites.findIndex(fav => fav.title === movie.title);
        if (index === -1) {
            // 收藏
            favorites.push(movie);
            localStorage.setItem("favorites", JSON.stringify(favorites));
            updateButton(true);
        } else {
            // 取消收藏
            favorites.splice(index, 1);
            localStorage.setItem("favorites", JSON.stringify(favorites));
            updateButton(false);
        }
    });

    function updateButton(fav) {
        if (fav) {
            favoriteBtn.textContent = "★ 已收藏";
            favoriteBtn.classList.add("favorited");
        } else {
            favoriteBtn.textContent = "☆ 收藏";
            favoriteBtn.classList.remove("favorited");
        }
    }
});
