//selectors
const form = document.getElementById('form');
const search = document.getElementById('search');
const result = document.getElementById('result');
const more = document.getElementById('more');

const apiURL = 'https://api.lyrics.ovh';

//search by song or artist
async function searchSongs(term) {
    try {
        result.innerHTML = '<p>Loading results...</p>';
        more.innerHTML = '';

        const res = await fetch(`${apiURL}/suggest/${encodeURIComponent(term)}`);
        if (!res.ok) throw new Error(`Search request failed: ${res.status}`);

        const data = await res.json();

        // render results into the DOM
        showDataSafe(data);
    } catch (err) {
        result.innerHTML = '';
        const p = document.createElement('p');
        p.textContent = 'Error fetching search results. ' + err.message;
        result.appendChild(p);
        more.innerHTML = '';
        console.error(err);
    }
}

//event listeners
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const searchTerm = search.value.trim();

    if (!searchTerm) {
        alert('Please type in a search term');
        return;
    }

    searchSongs(searchTerm);
});

// show data in DOM

// show song and artist in DOM
function showDataUnsafe(lyrics) {
    result.innerHTML = `
        <ul class="songs">
            ${lyrics.data
                .map(
                    (song) => `<li>
            <span><strong>${song.artist.name}</strong> - ${song.title}</span>
            <button class="but" data-artist="${song.artist.name}" data-songtitle="${song.title}">Get Lyrics</button>
        </li>`
                )
                .join('')}
        </ul>
    `;

    if (lyrics.prev || lyrics.next) {
        more.innerHTML = `
        ${
            lyrics.prev
                ? `<button class="but" onclick="getMoreSongs('${lyrics.prev}')">Prev</button>`
                : ''
        }
        ${
            lyrics.next
                ? `<button class="but" onclick="getMoreSongs('${lyrics.next}')">Next</button>`
                : ''
        }
    `;
    } else {
        more.innerHTML = '';
    }
}

function showDataSafe(lyrics) {
    result.innerHTML = '';
    more.innerHTML = '';

    const ul = document.createElement('ul');
    ul.className = 'songs';

    lyrics.data.forEach((song) => {
        const li = document.createElement('li');

        const span = document.createElement('span');

        const strong = document.createElement('strong');
        strong.textContent = song.artist.name;

        span.appendChild(strong);
        span.appendChild(document.createTextNode(` - ${song.title}`));
        li.appendChild(span);

        const button = document.createElement('button');
        button.className = 'but';
        button.textContent = 'Get Lyrics';
        button.dataset.artist = song.artist.name;
        button.dataset.songtitle = song.title;

        li.appendChild(button);
        ul.appendChild(li);
    });

    result.appendChild(ul);

    if (lyrics.prev || lyrics.next) {
        if (lyrics.prev) {
            const prevButton = document.createElement('button');
            prevButton.className = 'but';
            prevButton.textContent = 'Prev';
            prevButton.addEventListener('click', () => getMoreSongs(lyrics.prev));
            more.appendChild(prevButton);
        }

        if (lyrics.next) {
            const nextButton = document.createElement('button');
            nextButton.className = 'but';
            nextButton.textContent = 'Next';
            nextButton.addEventListener('click', () => getMoreSongs(lyrics.next));
            more.appendChild(nextButton);
        }
    }
}

// fetch next/prev pages (API returns full url for prev/next)
async function getMoreSongs(url) {
    try {
        result.innerHTML = '<p>Loading...</p>';
        more.innerHTML = '';

        const res = await fetch(url);
        if (!res.ok) throw new Error(`Pagination request failed: ${res.status}`);

        const data = await res.json();
        showDataSafe(data);
    } catch (err) {
        result.innerHTML = '';
        const p = document.createElement('p');
        p.textContent = 'Error fetching more results. ' + err.message;
        result.appendChild(p);
        console.error(err);
    }
}

// lyrics button click
result.addEventListener('click', (e) => {
    const clickedEl = e.target;

    if (clickedEl.tagName === 'BUTTON') {
        const artist = clickedEl.getAttribute('data-artist');
        const songTitle = clickedEl.getAttribute('data-songtitle');

        // getLyricsUnsafe(artist, songTitle);
        getLyricsSafe(artist, songTitle);
    }
});

// get lyrics for song
async function getLyricsUnsafe(artist, songTitle) {
    try {
        result.innerHTML = '<p>Loading lyrics...</p>';
        more.innerHTML = '';

        const res = await fetch(`${apiURL}/v1/${encodeURIComponent(artist)}/${encodeURIComponent(songTitle)}`);
        if (!res.ok) throw new Error(`Lyrics request failed: ${res.status}`);

        const data = await res.json();

        if (data.error) {
            result.innerHTML = '';
            const p = document.createElement('p');
            p.textContent = data.error;
            result.appendChild(p);
        } else {
            const lyrics = data.lyrics.replace(/(\r\n|\r|\n)/g, '<br>');

            result.innerHTML = `\n            <h2><strong>${artist}</strong> - ${songTitle}</h2>\n            <span>${lyrics}</span>\n            `;
        }
    } catch (err) {
        result.innerHTML = '';
        const p = document.createElement('p');
        p.textContent = 'Error fetching lyrics. ' + err.message;
        result.appendChild(p);
        console.error(err);
    }
    more.innerHTML = '';
}

async function getLyricsSafe(artist, songTitle) {
    try {
        result.innerHTML = '';
        more.innerHTML = '';

        const res = await fetch(`${apiURL}/v1/${encodeURIComponent(artist)}/${encodeURIComponent(songTitle)}`);
        if (!res.ok) throw new Error(`Lyrics request failed: ${res.status}`);

        const data = await res.json();

        if (data.error) {
            const errorMessage = document.createElement('p');
            errorMessage.textContent = data.error;
            result.append(errorMessage);
            return;
        }

        // create heading
        const heading = document.createElement('h2');
        const strong = document.createElement('strong');
        strong.textContent = artist;

        heading.append(strong, ` - ${songTitle}`);
        result.append(heading);

        // create lyrics block with line breaks
        const span = document.createElement('span');
        const lines = data.lyrics.split(/\r\n|\r|\n/);
        lines.forEach((line, index) => {
            span.append(line);
            if (index < lines.length - 1) {
                span.append(document.createElement('br'));
            }
        });

        result.append(span);
    } catch (err) {
        result.innerHTML = '';
        const p = document.createElement('p');
        p.textContent = 'Error fetching lyrics. ' + err.message;
        result.appendChild(p);
        console.error(err);
    }
}