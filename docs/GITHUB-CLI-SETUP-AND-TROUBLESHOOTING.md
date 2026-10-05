# Multi-Account Setup: Google → GitHub → Vercel

A project- and account-agnostic guide for connecting Google, GitHub, and Vercel correctly. Use this **at the beginning** of any new project or when adding a new account to avoid "Repository not found," Vercel deployment blocks, and credential conflicts.

**Use case:** You have multiple Google, GitHub, and Vercel accounts (personal, work, client, side projects). You want each project to deploy reliably on Vercel Hobby tier without authentication surprises.

---

## Part 1: Why This Matters (Layperson Terms)

### The chain: Google → GitHub → Vercel

1. **Google** — You sign into GitHub with a Google account (or email).
2. **GitHub** — Your code lives here. Git pushes and pulls use GitHub credentials.
3. **Vercel** — Connects to GitHub to deploy. Vercel uses **GitHub’s OAuth**, not your email.

### Why things break

- **Multiple accounts:** Personal, work, client — each has its own GitHub and Vercel.
- **Stale credentials:** macOS Keychain or old tokens keep Git using the wrong account.
- **Vercel uses GitHub, not email:** Even if username/email look the same, Vercel deploys based on which **GitHub account** is connected. Wrong GitHub = blocked or failed deployments.
- **Hobby tier:** One Vercel account, one GitHub connection. Mismatched accounts cause deployment blocks.

### The fix

Use **GitHub CLI** as the single source of truth for Git credentials. Log in with `gh`, configure Git to use `gh`, and keep the correct account active. Do this **before** pushing or connecting Vercel.

---

## Part 2: Vercel Hobby Tier Deployment Blocking

### What can happen

- Vercel shows deployment blocked or failed.
- Repo exists, username/email match, but deployments don’t work.
- Error messages about permissions or repository access.

### Why it happens

Vercel deploys via its **GitHub integration**. It uses:

- The **GitHub account** connected to your Vercel project
- The **GitHub token** Vercel has for that account

If Git on your machine uses a different GitHub account (e.g. via Keychain), you might:

- Push from Account A
- Have Vercel connected to Account B
- Or have Vercel connected to an account with outdated/revoked tokens

Result: Vercel can’t access the repo or gets permission errors.

### How fixing Git + GitHub CLI helps

1. **`gh auth login`** — Logs you into the correct GitHub account.
2. **`gh auth setup-git`** — Makes Git use that account for push/pull.
3. **`gh auth switch`** — Switches between accounts when you have several.

Once Git and GitHub are aligned, pushes go to the repo that Vercel expects. Reconnecting Vercel to GitHub (or re-importing the project) often clears deployment blocks because the connection is consistent.

### Hobby tier note

On Hobby tier you’re optimizing for cost. One Vercel account per “identity” (e.g. personal vs work) is typical. Ensure each Vercel project is connected to the **correct GitHub account** that owns the repo. Doing the setup below first reduces mismatches.

---

## Part 3: Prerequisites (Any Project, Any Account)

1. **Install GitHub CLI**
   ```bash
   brew install gh
   ```

2. **Verify installation**
   ```bash
   gh --version
   ```

---

## Part 4: Do This First (New Project or New Account)

Run this **before** creating repos, pushing code, or connecting Vercel.

### Step 1: Log in to GitHub via CLI

```bash
gh auth login
```

When prompted:

1. **What account do you want to log into?**  
   → `GitHub.com`

2. **What is your preferred protocol for Git operations?**  
   → `HTTPS`

3. **Authenticate Git with your GitHub credentials?**  
   → `Yes`

4. **How would you like to authenticate?**  
   → `Login with a web browser`

5. Copy the one-time code (e.g. `BF3D-E7DD`)
6. Press Enter to open the browser
7. Paste the code at https://github.com/login/device
8. Approve the login
9. Return to the terminal

**Non-interactive:**
```bash
gh auth login --web --git-protocol https
```

---

### Step 2: Switch to the correct account (if you have multiple)

```bash
gh auth status
```

Check which account is active. If it’s the wrong one:

```bash
gh auth switch -u YOUR_GITHUB_USERNAME
```

Replace `YOUR_GITHUB_USERNAME` with the account that owns the repo (e.g. personal, work, or client).

---

### Step 3: Configure Git to use GitHub CLI credentials

```bash
gh auth setup-git
```

This is **critical**. Without it, Git may keep using old Keychain credentials and the wrong account.

---

### Step 4: Verify

```bash
gh auth status
```

You should see the correct account as active and `Git operations protocol: https`.

---

## Part 5: Project Setup (After Authentication)

### New project

```bash
cd /path/to/your/project
git init
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git add -A
git commit -m "Initial commit"
git push -u origin main
```

### Existing project (clone)

```bash
gh auth switch -u YOUR_USERNAME   # if needed
gh repo clone YOUR_USERNAME/YOUR_REPO
cd YOUR_REPO
```

### Push changes

```bash
git add -A
git commit -m "Your message"
git push origin main
```

---

## Part 6: Connecting Vercel (Hobby Tier)

1. Go to [vercel.com](https://vercel.com) and sign in with the account you want.
2. **Add New Project** → **Import Git Repository**.
3. If prompted, **connect GitHub**. Choose the GitHub account that owns the repo.
4. Select the repository. Ensure it matches the account you used for `gh auth switch`.
5. Configure build settings and deploy.

### If deployment was previously blocked

1. Ensure Git is using the correct GitHub account (`gh auth status`, `gh auth switch`).
2. In Vercel: **Project Settings** → **Git**.
3. Disconnect and reconnect the repository, or remove and re-import the project.
4. Redeploy.

---

## Part 7: Command Reference (Quick Copy-Paste)

| Action | Command |
|--------|---------|
| Log in (interactive) | `gh auth login` |
| Log in (web, HTTPS) | `gh auth login --web --git-protocol https` |
| Check login status | `gh auth status` |
| Switch account | `gh auth switch -u USERNAME` |
| Configure Git to use gh | `gh auth setup-git` |
| Log out | `gh auth logout` |
| Log out (specific host) | `gh auth logout -h github.com` |

---

## Part 8: Troubleshooting

### "Repository not found" when pushing

1. `gh auth status` — confirm active account.
2. `gh auth switch -u CORRECT_USERNAME` — switch if needed.
3. `gh auth setup-git` — ensure Git uses gh.
4. `git push origin main` — try again.

---

### Vercel deployment blocked or failed

1. Confirm the repo exists: `gh repo view USERNAME/REPO`
2. Ensure you’re pushing with the same GitHub account Vercel uses: `gh auth status`
3. In Vercel: **Settings** → **Git** → reconnect the repository.
4. If needed, remove the project and re-import from GitHub.

---

### "failed to set up git credential helper: could not lock config file"

`~/.gitconfig` can’t be written. Run `gh auth setup-git` from a normal terminal (not inside a sandboxed/restricted environment).

---

### "failed to move active token in keyring"

Keychain access issue. Run `gh auth switch` from a normal terminal with full permissions.

---

### Multiple accounts — which one is used?

`gh auth status` lists all logged-in accounts. The one with **Active account: true** is used for `git push`, `git pull`, and `gh` commands.

---

## Part 9: Checklist for New Projects / New Accounts

Use this when starting a new project or adding a new GitHub/Vercel account:

- [ ] Install GitHub CLI (`brew install gh`)
- [ ] Log in: `gh auth login --web --git-protocol https`
- [ ] Switch to correct account: `gh auth switch -u USERNAME`
- [ ] Configure Git: `gh auth setup-git`
- [ ] Verify: `gh auth status`
- [ ] Create or clone repo
- [ ] Push initial commit
- [ ] Connect Vercel to the same GitHub account
- [ ] Deploy and confirm it works

---

## Part 10: Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│  BROKEN (wrong credentials):                                             │
│                                                                          │
│  git push  →  Git  →  Keychain (old/wrong account)  →  GitHub           │
│                                                              ↓           │
│  Vercel  ←  GitHub (different account / token)  ←  "Repository not found" │
│  Deployment blocked or failed                                             │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  FIXED (gh as single source of truth):                                   │
│                                                                          │
│  gh auth login  →  gh auth setup-git  →  Git uses gh credentials         │
│                                                                          │
│  git push  →  Git  →  gh  →  GitHub (correct account)  →  Success       │
│                                                                          │
│  Vercel  ←  GitHub (same account)  ←  Deployment works                  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Part 11: Account-Agnostic Summary

| Layer | What to do |
|-------|------------|
| **Google** | Use the Google account you want for GitHub sign-in. |
| **GitHub** | Log in with `gh auth login`, switch with `gh auth switch`, run `gh auth setup-git`. |
| **Git** | Uses gh credentials after `gh auth setup-git`. |
| **Vercel** | Connect to the same GitHub account that owns the repo. |

**Rule of thumb:** One GitHub account per project. One Vercel project per repo. Align all three (Git, GitHub, Vercel) before the first push.

---

*Last updated: February 2026. Project- and account-agnostic. Applicable to Hobby tier and paid plans.*
