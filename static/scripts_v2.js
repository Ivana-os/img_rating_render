let currentIndex = 1;
const maxIndex = 56;
const firstRowFolders = [5, 1, 2, 3];

document.addEventListener('DOMContentLoaded', async () => {
  await showImages(currentIndex);
});

async function resolveImagePath(folderNum, index, extensions = ['.jpg', '.jpeg', '.png']) {
  for (const ext of extensions) {
    const path = `/static/images/folder${folderNum}/img${index}${ext}`;
    const exists = await checkImageExists(path);
    if (exists) return path;
  }
  throw new Error('Image not found.');
}

function checkImageExists(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

async function showImages(index) {
  const container = document.getElementById('image-container');
  const row = container.querySelector('.image-row');
  row.innerHTML = '';

  for (let i = 0; i < firstRowFolders.length; i++) {
    const folderNum = firstRowFolders[i];
    const block = document.createElement('div');
    block.className = 'image-block';

    const img = new Image();
    try {
      img.src = await resolveImagePath(folderNum, index);
    } catch {
      img.alt = 'Image not found';
    }

    block.appendChild(img);

    if (i === 0) {
      const ref = document.createElement('p');
      ref.textContent = 'Reference';
      block.appendChild(ref);
    } else {
      const ratingDiv = document.createElement('div');
      ratingDiv.className = 'star-rating';

      for (let s = 4; s >= 1; s--) {
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = `folder${folderNum}`;
        input.value = s;
        input.id = `${input.name}_${s}`;

        const label = document.createElement('label');
        label.htmlFor = input.id;
        label.textContent = '★';

        ratingDiv.append(input, label);
      }

      block.appendChild(ratingDiv);
    }

    row.appendChild(block);
  }

  updateProgress(index);
}

function collectRatings() {
  const ratings = {};
  document.querySelectorAll('.star-rating').forEach(div => {
    const name = div.querySelector('input')?.name;
    const checked = div.querySelector('input:checked');
    if (name && checked) ratings[name] = checked.value;
  });
  return ratings;
}

function updateProgress(index) {
  const progress = (index / maxIndex * 100).toFixed(1);
  document.getElementById('progress-bar').style.width = `${progress}%`;
  document.getElementById('counter').textContent = `Set ${index} of ${maxIndex}`;
}

async function submitRatings() {
  const ratings = collectRatings();
  const required = document.querySelectorAll('.star-rating');
  const allRated = [...required].every(div => div.querySelector('input:checked'));

  if (!allRated) {
    alert('Please rate all images before continuing.');
    return;
  }

  try {
    const response = await fetch('/rate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ index: currentIndex, ratings })
    });

    const result = await response.text();
    console.log(result);
    currentIndex++;

    if (currentIndex > maxIndex) {
      showCompletion();
    } else {
      await showImages(currentIndex);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Submission failed.');
  }
}

function showCompletion() {
  document.getElementById('progress-bar').style.width = '100%';
  document.getElementById('counter').textContent = 'All images rated!';
  document.querySelector('button').style.display = 'none';
  document.getElementById('finishBtn').style.display = 'inline-block';
}


