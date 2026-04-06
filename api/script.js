<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Script Vault Admin</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            background: linear-gradient(135deg, #0a0f1e 0%, #0c1222 100%);
            font-family: system-ui, sans-serif;
            color: #e2e8f0;
            padding: 2rem;
        }
        .container { max-width: 1200px; margin: 0 auto; }
        .card {
            background: rgba(18, 25, 45, 0.75);
            border-radius: 1rem;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            border: 1px solid #334155;
        }
        h1 { margin-bottom: 1rem; }
        input, textarea {
            width: 100%;
            background: #0f172a;
            border: 1px solid #334155;
            border-radius: 0.5rem;
            padding: 0.75rem;
            color: white;
            margin-bottom: 1rem;
        }
        button {
            background: #2563eb;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 0.5rem;
            color: white;
            cursor: pointer;
        }
        .script-item {
            background: #0f172a;
            border-radius: 0.5rem;
            padding: 1rem;
            margin-bottom: 0.5rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .delete-btn { background: #dc2626; }
        .raw-link {
            background: #1e293b;
            padding: 0.25rem 0.5rem;
            border-radius: 0.25rem;
            cursor: pointer;
            font-size: 0.75rem;
        }
    </style>
</head>
<body>
<div class="container">
    <div class="card">
        <h1>🔐 Private Script Vault</h1>
        <p>Admin Panel - Upload and manage your Roblox scripts</p>
    </div>

    <div class="card">
        <h2>📤 Upload New Script</h2>
        <input type="text" id="title" placeholder="Script Title (e.g., Owl Hub)">
        <textarea id="content" rows="8" placeholder="-- Your Lua script here&#10;print('Hello from script vault!')"></textarea>
        <button id="uploadBtn">✨ Upload Script</button>
        <div id="result" style="margin-top: 1rem;"></div>
    </div>

    <div class="card">
        <h2>📜 Your Scripts</h2>
        <div id="scriptsList">Loading...</div>
    </div>
</div>

<script>
async function loadScripts() {
    try {
        const res = await fetch('/api/scripts');
        const scripts = await res.json();
        const container = document.getElementById('scriptsList');
        
        if (scripts.length === 0) {
            container.innerHTML = '<p>No scripts yet. Upload your first script!</p>';
            return;
        }
        
        container.innerHTML = scripts.map(s => `
            <div class="script-item">
                <div>
                    <strong>📜 ${escapeHtml(s.title)}</strong><br>
                    <small>ID: ${s.id} | Created: ${new Date(s.created_at).toLocaleString()}</small><br>
                    <span class="raw-link" onclick="copyRaw(${s.id})">🔗 Copy Raw Link (for Roblox executor)</span>
                </div>
                <button class="delete-btn" onclick="deleteScript(${s.id})">Delete</button>
            </div>
        `).join('');
    } catch (err) {
        document.getElementById('scriptsList').innerHTML = '<p style="color:red;">Error loading scripts. Make sure server is running.</p>';
    }
}

async function uploadScript() {
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    
    if (!title || !content) {
        alert('Please enter both title and content');
        return;
    }
    
    const btn = document.getElementById('uploadBtn');
    btn.disabled = true;
    btn.textContent = 'Uploading...';
    
    try {
        const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content })
        });
        const data = await res.json();
        
        if (res.ok) {
            document.getElementById('result').innerHTML = `<p style="color:green;">✅ Uploaded! Script ID: ${data.id}</p>`;
            document.getElementById('title').value = '';
            document.getElementById('content').value = '';
            loadScripts();
        } else {
            document.getElementById('result').innerHTML = `<p style="color:red;">❌ Error: ${data.error}</p>`;
        }
    } catch (err) {
        document.getElementById('result').innerHTML = '<p style="color:red;">❌ Upload failed</p>';
    } finally {
        btn.disabled = false;
        btn.textContent = '✨ Upload Script';
    }
}

async function deleteScript(id) {
    if (!confirm('Delete this script permanently?')) return;
    
    try {
        await fetch('/api/delete', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        loadScripts();
    } catch (err) {
        alert('Delete failed');
    }
}

function copyRaw(id) {
    const url = `${window.location.origin}/api/raw?id=${id}`;
    navigator.clipboard.writeText(url);
    alert(`Copied! Use in Roblox executor:\nloadstring(game:HttpGet("${url}"))()`);
}

function escapeHtml(str) {
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

document.getElementById('uploadBtn').addEventListener('click', uploadScript);
loadScripts();
</script>
</body>
</html>
