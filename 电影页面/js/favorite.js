// favorite.js
const moviesList = document.getElementById("moviesList");
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

// 渲染收藏列表
function renderFavorites() {
    moviesList.innerHTML = "";

    if (favorites.length === 0) {
        moviesList.innerHTML = "<p class='empty'>你还没有收藏任何电影</p>";
        return;
    }

    favorites.forEach((movie, index) => {
        const div = document.createElement("div");
        div.className = "movie";
        div.innerHTML = `
            <a href="${movie.link}">
                <img src="${movie.img}" alt="${movie.title}">
                <div class="movie-title">${movie.title}</div>
            </a>
            <button class="remove-btn" data-index="${index}">取消收藏</button>
        `;
        moviesList.appendChild(div);
    });

    // 绑定取消收藏事件
    const removeBtns = document.querySelectorAll(".remove-btn");
    removeBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
            const idx = e.target.dataset.index;
            favorites.splice(idx, 1);  // 删除对应电影
            localStorage.setItem("favorites", JSON.stringify(favorites));
            renderFavorites();  // 重新渲染
        });
    });
}

// 初次渲染
renderFavorites();
