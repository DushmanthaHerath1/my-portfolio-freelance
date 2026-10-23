document.addEventListener('DOMContentLoaded', () => {
    // 1. Parse Project ID from query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id');

    if (!projectId) {
        showError('No project ID specified in the URL query string.');
        return;
    }

    // 2. Fetch the corresponding JSON file
    fetch(`data/projects/${projectId}.json`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Project case study for ID "${projectId}" could not be found.`);
            }
            return response.json();
        })
        .then(data => {
            // Hydrate the project page
            hydrateProject(data);
        })
        .catch(error => {
            console.error('Error loading project:', error);
            showError(error.message);
        });

    // Hydration function
    function hydrateProject(data) {
        // Document Meta Title
        if (data.metaTitle) {
            document.title = data.metaTitle;
        } else if (data.title) {
            document.title = `${data.title} Case Study | Dushmantha Herath`;
        }

        // Hero Title & Description
        const heroTitle = document.getElementById('hero-title');
        const heroDesc = document.getElementById('hero-desc');
        if (heroTitle) heroTitle.textContent = data.title || 'Untitled Project';
        if (heroDesc) heroDesc.textContent = data.description || '';

        // Hero Tags
        const tagsContainer = document.getElementById('hero-tags');
        if (tagsContainer) {
            tagsContainer.innerHTML = '';
            if (data.tags && data.tags.length > 0) {
                data.tags.forEach(tag => {
                    const span = document.createElement('span');
                    span.className = "px-3 py-1 bg-surface-container-high rounded-full font-label-mono text-label-mono text-on-surface-variant";
                    span.textContent = tag;
                    tagsContainer.appendChild(span);
                });
            }
        }

        // Hero GitHub Link
        const heroGithubLink = document.getElementById('hero-github-link');
        if (heroGithubLink) {
            if (data.githubUrl) {
                heroGithubLink.href = data.githubUrl;
                heroGithubLink.classList.remove('hidden');
            } else {
                heroGithubLink.classList.add('hidden');
            }
        }

        // Screenshots Showcase
        const heroImage = document.getElementById('hero-image-img');
        const screenshotTitle = document.getElementById('active-screenshot-title');
        const screenshotCaption = document.getElementById('active-screenshot-caption');
        const thumbnailsContainer = document.getElementById('screenshot-thumbnails');

        const screenshots = (data.screenshots && data.screenshots.length > 0)
            ? data.screenshots
            : (data.heroImage ? [{ url: data.heroImage.url, title: data.title, caption: data.heroImage.alt }] : []);

        if (heroImage && screenshots.length > 0) {
            const setActiveScreenshot = (index) => {
                const item = screenshots[index];
                if (!item) return;

                heroImage.classList.add('opacity-40');
                setTimeout(() => {
                    heroImage.src = item.url;
                    heroImage.alt = item.title || item.caption || data.title;
                    if (screenshotTitle) screenshotTitle.textContent = item.title || `Screenshot ${index + 1}`;
                    if (screenshotCaption) screenshotCaption.textContent = item.caption || '';
                    heroImage.classList.remove('opacity-40');
                }, 150);

                if (thumbnailsContainer) {
                    const thumbButtons = thumbnailsContainer.querySelectorAll('button');
                    thumbButtons.forEach((btn, idx) => {
                        if (idx === index) {
                            btn.className = "group relative w-20 h-14 md:w-28 md:h-18 rounded-lg overflow-hidden border-2 border-primary shadow-sm transition-all scale-105";
                        } else {
                            btn.className = "group relative w-20 h-14 md:w-28 md:h-18 rounded-lg overflow-hidden border border-outline-variant hover:border-outline opacity-70 hover:opacity-100 transition-all";
                        }
                    });
                }
            };

            // Render thumbnails
            if (thumbnailsContainer) {
                thumbnailsContainer.innerHTML = '';
                if (screenshots.length > 1) {
                    screenshots.forEach((shot, idx) => {
                        const btn = document.createElement('button');
                        btn.type = 'button';
                        btn.setAttribute('aria-label', `View ${shot.title || 'screenshot ' + (idx + 1)}`);
                        btn.className = idx === 0
                            ? "group relative w-20 h-14 md:w-28 md:h-18 rounded-lg overflow-hidden border-2 border-primary shadow-sm transition-all scale-105"
                            : "group relative w-20 h-14 md:w-28 md:h-18 rounded-lg overflow-hidden border border-outline-variant hover:border-outline opacity-70 hover:opacity-100 transition-all";

                        btn.innerHTML = `
                            <img src="${shot.url}" alt="${shot.title || ''}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
                        `;
                        btn.addEventListener('click', () => setActiveScreenshot(idx));
                        thumbnailsContainer.appendChild(btn);
                    });
                }
            }

            // Set initial image
            heroImage.src = screenshots[0].url;
            heroImage.alt = screenshots[0].title || screenshots[0].caption || data.title;
            if (screenshotTitle) screenshotTitle.textContent = screenshots[0].title || 'Live Preview';
            if (screenshotCaption) screenshotCaption.textContent = screenshots[0].caption || '';
        }

        // Technologies & Tools
        const techImplSection = document.getElementById('tech-implementation-section');
        const techStackList = document.getElementById('tech-stack-list');
        if (techStackList && data.techStack && data.techStack.length > 0) {
            if (techImplSection) techImplSection.classList.remove('hidden');
            techStackList.innerHTML = '';
            data.techStack.forEach(tech => {
                const div = document.createElement('div');
                div.className = "p-stack-md bg-surface-container-lowest border border-outline-variant rounded-xl flex items-center gap-stack-sm shadow-sm hover:border-primary/40 hover:-translate-y-0.5 transition-all";
                div.innerHTML = `
                    <div class="w-9 h-9 rounded-lg bg-primary-container/10 flex items-center justify-center shrink-0">
                        <span class="material-symbols-outlined text-primary-container text-xl">${tech.icon || 'settings'}</span>
                    </div>
                    <span class="font-label-mono text-label-mono text-on-surface font-semibold truncate">${tech.label}</span>
                `;
                techStackList.appendChild(div);
            });
        } else if (techImplSection) {
            techImplSection.classList.add('hidden');
        }

        // Key Features
        const featuresSection = document.getElementById('features-section');
        const featuresGrid = document.getElementById('features-grid');
        if (featuresGrid && data.features && data.features.length > 0) {
            if (featuresSection) featuresSection.classList.remove('hidden');
            featuresGrid.innerHTML = '';
            data.features.forEach(feature => {
                const card = document.createElement('div');
                card.className = "bg-surface-container-lowest p-stack-lg rounded-xl border border-outline-variant shadow-[0px_4px_20px_rgba(15,23,42,0.05)] hover:-translate-y-1 hover:shadow-[0px_10px_30px_rgba(15,23,42,0.08)] transition-all duration-300 flex flex-col group";
                card.innerHTML = `
                    <div class="w-12 h-12 bg-primary-container/10 rounded-xl flex items-center justify-center mb-stack-md group-hover:bg-primary-container/20 group-hover:scale-110 transition-all text-primary-container">
                        <span class="material-symbols-outlined text-2xl">${feature.icon || 'star'}</span>
                    </div>
                    <h3 class="font-headline-md text-headline-md text-on-surface mb-stack-sm">${feature.title || ''}</h3>
                    <p class="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                        ${feature.description || ''}
                    </p>
                `;
                featuresGrid.appendChild(card);
            });
        } else if (featuresSection) {
            featuresSection.classList.add('hidden');
        }

        // More Projects
        const relatedSection = document.getElementById('related-projects-section');
        const relatedGrid = document.getElementById('related-projects-grid');
        if (relatedGrid) {
            relatedGrid.innerHTML = '';
            if (data.relatedProjects && data.relatedProjects.length > 0) {
                if (relatedSection) relatedSection.classList.remove('hidden');
                data.relatedProjects.forEach(project => {
                    const card = document.createElement('a');
                    card.href = `project.html?id=${project.id}`;
                    card.className = "group block overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-[0px_4px_20px_rgba(15,23,42,0.05)] hover:shadow-[0px_10px_30px_rgba(15,23,42,0.08)] hover:-translate-y-1 transition-all duration-300";
                    card.innerHTML = `
                        <div class="h-56 md:h-64 overflow-hidden relative bg-[#0F172A]/5 flex items-center justify-center">
                            <img alt="${project.title} screenshot" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="${project.image}"/>
                            <div class="absolute inset-0 bg-inverse-surface/10 group-hover:bg-transparent transition-colors"></div>
                        </div>
                        <div class="p-stack-md flex justify-between items-center">
                            <div>
                                <h3 class="font-headline-md text-headline-md text-on-surface group-hover:text-primary transition-colors">${project.title}</h3>
                                <p class="font-body-sm text-body-sm text-on-surface-variant mt-0.5">${project.subtitle || ''}</p>
                            </div>
                            <div class="w-9 h-9 rounded-full bg-surface-container-low flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-colors shrink-0">
                                <span class="material-symbols-outlined text-xl transition-transform group-hover:translate-x-0.5">arrow_forward</span>
                            </div>
                        </div>
                    `;
                    relatedGrid.appendChild(card);
                });
            } else {
                if (relatedSection) relatedSection.classList.add('hidden');
            }
        }
    }

    // Dynamic error page generation
    function showError(message) {
        const mainEl = document.querySelector('main');
        if (mainEl) {
            mainEl.innerHTML = `
                <section class="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-stack-lg scroll-reveal revealed">
                    <div class="space-y-stack-md max-w-xl">
                        <span class="material-symbols-outlined text-error text-6xl" style="font-variation-settings: 'FILL' 1;">error</span>
                        <h1 class="font-headline-xl text-headline-xl text-on-surface">Case Study Not Found</h1>
                        <p class="font-body-lg text-body-lg text-on-surface-variant mt-2">
                            ${message || 'We could not find the case study you are looking for. It might have been moved or deleted.'}
                        </p>
                    </div>
                    <a class="inline-flex items-center gap-2 px-6 py-3 bg-primary text-on-primary font-body-md text-body-md rounded-lg hover:opacity-90 active:scale-95 transition-all shadow-sm mt-4" href="index.html#work">
                        <span class="material-symbols-outlined">arrow_back</span>
                        Back to Selected Work
                    </a>
                </section>
            `;
        }
    }
});
