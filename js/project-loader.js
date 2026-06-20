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
            document.title = `${data.title} Case Study | Neon`;
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

        // Hero Image
        const heroImage = document.getElementById('hero-image-img');
        if (heroImage && data.heroImage) {
            heroImage.src = data.heroImage.url || '';
            heroImage.alt = data.heroImage.alt || data.title || 'Project image';
        }

        // Overview
        const overviewSection = document.getElementById('overview-section');
        const overviewContent = document.getElementById('overview-content');
        if (overviewContent) {
            overviewContent.innerHTML = '';
            if (data.overview && data.overview.length > 0) {
                if (overviewSection) overviewSection.classList.remove('hidden');
                data.overview.forEach(paragraph => {
                    const p = document.createElement('p');
                    p.className = "font-body-md text-body-md text-on-surface-variant";
                    p.textContent = paragraph;
                    overviewContent.appendChild(p);
                });
            } else {
                if (overviewSection) overviewSection.classList.add('hidden');
            }
        }

        // Technical Implementation Section
        const techImplSection = document.getElementById('tech-implementation-section');
        const techStackList = document.getElementById('tech-stack-list');
        const techDetailsContainer = document.getElementById('tech-implementation-details-container');
        const techDetailsGrid = document.getElementById('implementation-details-grid');

        let showTechSection = false;

        // Tech stack items
        if (techStackList) {
            techStackList.innerHTML = '';
            if (data.techStack && data.techStack.length > 0) {
                showTechSection = true;
                techStackList.classList.remove('hidden');
                data.techStack.forEach(tech => {
                    const div = document.createElement('div');
                    div.className = "p-stack-md bg-surface-container-lowest border border-outline-variant rounded-lg flex items-center gap-stack-sm";
                    div.innerHTML = `
                        <span class="material-symbols-outlined text-primary-container text-2xl">${tech.icon || 'settings'}</span>
                        <span class="font-label-mono text-label-mono text-on-surface">${tech.label}</span>
                    `;
                    techStackList.appendChild(div);
                });
            } else {
                techStackList.classList.add('hidden');
            }
        }

        // Dynamic Columns/Details
        if (techDetailsGrid) {
            techDetailsGrid.innerHTML = '';
            if (data.implementation && data.implementation.sections && data.implementation.sections.length > 0) {
                showTechSection = true;
                if (techDetailsContainer) techDetailsContainer.classList.remove('hidden');

                const totalSections = data.implementation.sections.length;
                data.implementation.sections.forEach(section => {
                    const card = document.createElement('div');
                    // If only one section exists, span full width
                    const colSpanClass = totalSections === 1 ? 'col-span-1 md:col-span-2' : '';
                    card.className = `bg-surface-container-low p-stack-lg rounded-xl border border-outline-variant ${colSpanClass}`;

                    let codeBlockHtml = '';
                    if (section.code && section.code.trim() !== '') {
                        // Safe HTML escaping
                        const escapedCode = section.code
                            .replace(/&/g, '&amp;')
                            .replace(/</g, '&lt;')
                            .replace(/>/g, '&gt;');
                        codeBlockHtml = `
                            <div class="bg-inverse-surface rounded-lg p-stack-sm overflow-hidden border border-outline/20 mt-stack-md">
                                <pre class="font-code-block text-code-block text-surface-container-low overflow-x-auto"><code>${escapedCode}</code></pre>
                            </div>
                        `;
                    }

                    const paragraphMargin = (section.code && section.code.trim() !== '') ? 'mb-stack-md' : '';

                    card.innerHTML = `
                        <h3 class="font-headline-md text-headline-md text-on-surface mb-stack-sm">${section.title || 'Feature implementation'}</h3>
                        <p class="font-body-md text-body-md text-on-surface-variant ${paragraphMargin}">
                            ${section.description || ''}
                        </p>
                        ${codeBlockHtml}
                    `;
                    techDetailsGrid.appendChild(card);
                });
            } else {
                if (techDetailsContainer) techDetailsContainer.classList.add('hidden');
            }
        }

        if (techImplSection) {
            if (showTechSection) {
                techImplSection.classList.remove('hidden');
            } else {
                techImplSection.classList.add('hidden');
            }
        }

        // Features Grid
        const featuresSection = document.getElementById('features-section');
        const featuresGrid = document.getElementById('features-grid');
        if (featuresGrid) {
            featuresGrid.innerHTML = '';
            if (data.features && data.features.length > 0) {
                if (featuresSection) featuresSection.classList.remove('hidden');
                
                // Adjust layout columns based on counts
                const totalFeatures = data.features.length;
                const colsClass = totalFeatures === 2 ? 'md:grid-cols-2' : (totalFeatures === 1 ? 'md:grid-cols-1 max-w-xl mx-auto' : 'md:grid-cols-3');
                featuresGrid.className = `grid grid-cols-1 ${colsClass} gap-gutter`;

                data.features.forEach(feature => {
                    const card = document.createElement('div');
                    card.className = "bg-surface-container-lowest p-stack-lg rounded-xl border border-outline-variant shadow-[0px_4px_20px_rgba(15,23,42,0.05)] hover:-translate-y-1 hover:shadow-[0px_10px_30px_rgba(15,23,42,0.08)] transition-all duration-300 flex flex-col items-center text-center group";
                    card.innerHTML = `
                        <div class="w-16 h-16 bg-primary-container/10 rounded-full flex items-center justify-center mb-stack-md group-hover:bg-primary-container/20 transition-colors">
                            <span class="material-symbols-outlined text-primary-container text-3xl">${feature.icon || 'star'}</span>
                        </div>
                        <h3 class="font-headline-md text-headline-md text-on-surface mb-stack-sm">${feature.title || ''}</h3>
                        <p class="font-body-sm text-body-sm text-on-surface-variant">
                            ${feature.description || ''}
                        </p>
                    `;
                    featuresGrid.appendChild(card);
                });
            } else {
                if (featuresSection) featuresSection.classList.add('hidden');
            }
        }

        // Results Section
        const resultsSection = document.getElementById('results-section');
        const resultsDescription = document.getElementById('results-description');
        const resultsStatsGrid = document.getElementById('results-stats-grid');
        if (resultsSection) {
            if (data.results) {
                resultsSection.classList.remove('hidden');
                if (resultsDescription) resultsDescription.textContent = data.results.description || '';
                
                if (resultsStatsGrid) {
                    resultsStatsGrid.innerHTML = '';
                    if (data.results.stats && data.results.stats.length > 0) {
                        resultsStatsGrid.classList.remove('hidden');
                        
                        const totalStats = data.results.stats.length;
                        const statsCols = totalStats === 2 ? 'md:grid-cols-2' : (totalStats === 1 ? 'md:grid-cols-1 max-w-sm mx-auto' : 'md:grid-cols-3');
                        resultsStatsGrid.className = `grid grid-cols-1 ${statsCols} gap-stack-md pt-stack-md`;

                        data.results.stats.forEach(stat => {
                            const statCard = document.createElement('div');
                            statCard.className = "bg-surface-container-lowest p-stack-md rounded-xl border border-outline-variant";
                            statCard.innerHTML = `
                                <div class="font-headline-xl text-headline-xl text-primary mb-1">${stat.value}</div>
                                <div class="font-body-sm text-body-sm text-on-surface-variant font-medium">${stat.label || ''}</div>
                            `;
                            resultsStatsGrid.appendChild(statCard);
                        });
                    } else {
                        resultsStatsGrid.classList.add('hidden');
                    }
                }
            } else {
                resultsSection.classList.add('hidden');
            }
        }

        // Related Projects
        const relatedSection = document.getElementById('related-projects-section');
        const relatedGrid = document.getElementById('related-projects-grid');
        if (relatedGrid) {
            relatedGrid.innerHTML = '';
            if (data.relatedProjects && data.relatedProjects.length > 0) {
                if (relatedSection) relatedSection.classList.remove('hidden');
                data.relatedProjects.forEach(project => {
                    const card = document.createElement('a');
                    card.href = `project.html?id=${project.id}`;
                    card.className = "group block overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-[0px_4px_20px_rgba(15,23,42,0.05)] hover:shadow-[0px_10px_30px_rgba(15,23,42,0.08)] transition-all duration-300";
                    card.innerHTML = `
                        <div class="h-64 overflow-hidden relative">
                            <img alt="${project.title} screenshot" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="${project.image}"/>
                            <div class="absolute inset-0 bg-inverse-surface/10 group-hover:bg-transparent transition-colors"></div>
                        </div>
                        <div class="p-stack-md flex justify-between items-center">
                            <div>
                                <h3 class="font-headline-md text-headline-md text-on-surface group-hover:text-primary transition-colors">${project.title}</h3>
                                <p class="font-body-sm text-body-sm text-on-surface-variant">${project.subtitle || ''}</p>
                            </div>
                            <span class="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors group-hover:translate-x-1 duration-300">arrow_forward</span>
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
                    <a class="inline-flex items-center gap-2 px-6 py-3 bg-primary text-on-primary font-body-md text-body-md rounded-lg hover:opacity-90 active:scale-95 transition-all shadow-sm mt-4" href="index.html">
                        <span class="material-symbols-outlined">arrow_back</span>
                        Back to Homepage
                    </a>
                </section>
            `;
        }
    }
});
