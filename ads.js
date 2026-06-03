// Simulador de Google AdSense
(function() {
  const adsData = [
    {
      title: "Pesquise pessoas e empresas",
      desc: "Inteligência de dados para pesquisa de CPF, CNPJ, telefone e e-mail em segundos. Comece grátis com Obsidion!",
      url: "https://www.obsidion.com.br",
      cta: "Saiba mais",
      domain: "obsidion.com.br",
      img: "https://www.obsidion.com.br/images/logo.png"
    },
    {
      title: "A Arma Secreta do Corretor",
      desc: "Localize o dono de qualquer imóvel em Itapema-SC com nome, CPF e celular em segundos com o ImobHunter.",
      url: "https://www.imobhunter.com.br",
      cta: "Instalar",
      domain: "imobhunter.com.br",
      img: "https://www.imobhunter.com.br/assets/logo3.png"
    },
    {
      title: "Imóveis em Itapema e Meia Praia",
      desc: "Venda e locação de imóveis em SC. Simplificamos suas transações imobiliárias na Invest Dream.",
      url: "https://www.investdreamimoveis.com.br",
      cta: "Ver ofertas",
      domain: "investdreamimoveis.com.br",
      img: "https://d78txhfo8gp8r.cloudfront.net/invest/arquivos/logo_compartilhar.jpg"
    }
  ];

  let usedAdIndices = [];

  function getRandomAd() {
    if (usedAdIndices.length >= adsData.length) {
      usedAdIndices = []; // Reinicia quando todos já foram usados
    }
    
    let availableIndices = [];
    for (let i = 0; i < adsData.length; i++) {
      if (!usedAdIndices.includes(i)) {
        availableIndices.push(i);
      }
    }
    
    const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    usedAdIndices.push(randomIndex);
    
    return adsData[randomIndex];
  }

  function createAdChoicesHeader() {
    return `
      <div class="mock-ad-header">
        <span class="mock-ad-label">Anúncio</span>
        <div class="mock-ad-choices">
          <i class="fa-solid fa-info-circle"></i>
          <i class="fa-solid fa-times close-ad-btn" title="Fechar anúncio"></i>
        </div>
      </div>
    `;
  }

  function injectBoxAds() {
    const adContainers = document.querySelectorAll('.mock-ad-container');
    
    adContainers.forEach(container => {
      // Evitar injetar mais de uma vez
      if (container.dataset.adInjected) return;
      container.dataset.adInjected = "true";

      const ad = getRandomAd();
      const format = container.dataset.adFormat || 'auto'; // 'box', 'horizontal', etc

      container.innerHTML = `
        <div class="mock-ad-wrapper format-${format}">
          ${createAdChoicesHeader()}
          <a href="${ad.url}" target="_blank" class="mock-ad-content">
            <div class="mock-ad-image-wrapper">
              <img src="${ad.img}" alt="Ad image" class="mock-ad-img" onerror="this.src='https://via.placeholder.com/150?text=Ad'"/>
            </div>
            <div class="mock-ad-text">
              <h4>${ad.title}</h4>
              <p>${ad.desc}</p>
              <div class="mock-ad-footer">
                <span class="mock-ad-domain">${ad.domain}</span>
                <span class="mock-ad-cta">${ad.cta}</span>
              </div>
            </div>
          </a>
        </div>
      `;

      // Evento de fechar o anúncio (AdSense behavior)
      const closeBtn = container.querySelector('.close-ad-btn');
      if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          container.innerHTML = `
            <div class="mock-ad-closed">
              <p>Anúncio fechado pelo Google</p>
              <button class="mock-ad-undo">Desfazer</button>
            </div>
          `;
          const undo = container.querySelector('.mock-ad-undo');
          undo.addEventListener('click', () => {
            container.dataset.adInjected = "";
            injectBoxAds(); // Reinjetar
          });
        });
      }
    });
  }

  function injectAnchorAd() {
    if (document.getElementById('mock-anchor-ad')) return;

    const ad = getRandomAd();
    const anchorAd = document.createElement('div');
    anchorAd.id = 'mock-anchor-ad';
    anchorAd.className = 'mock-anchor-ad';
    
    anchorAd.innerHTML = `
      <div class="mock-anchor-wrapper">
        <div class="mock-anchor-header">
          <div class="mock-anchor-handle"></div>
          <div class="mock-anchor-close"><i class="fa-solid fa-chevron-down"></i></div>
        </div>
        ${createAdChoicesHeader()}
        <a href="${ad.url}" target="_blank" class="mock-anchor-content">
          <img src="${ad.img}" alt="Ad" class="mock-anchor-img" onerror="this.src='https://via.placeholder.com/50?text=Ad'" />
          <div class="mock-anchor-text">
            <strong>${ad.title}</strong>
            <span>${ad.domain}</span>
          </div>
          <div class="mock-anchor-cta">${ad.cta}</div>
        </a>
      </div>
    `;

    document.body.appendChild(anchorAd);

    // Fechar anchor ad
    anchorAd.querySelector('.mock-anchor-close').addEventListener('click', () => {
      anchorAd.style.display = 'none';
    });
    anchorAd.querySelector('.close-ad-btn').addEventListener('click', (e) => {
      e.preventDefault();
      anchorAd.style.display = 'none';
    });
  }

  function showVignetteAd() {
    // Popup interticial
    if (document.getElementById('mock-vignette-ad')) return;

    const ad = getRandomAd();
    const vignetteAd = document.createElement('div');
    vignetteAd.id = 'mock-vignette-ad';
    vignetteAd.className = 'mock-vignette-ad';
    
    vignetteAd.innerHTML = `
      <div class="mock-vignette-overlay">
        <div class="mock-vignette-content">
          <div class="mock-vignette-topbar">
            <span>Anúncio</span>
            <button class="mock-vignette-close"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <a href="${ad.url}" target="_blank" class="mock-vignette-body">
            <img src="${ad.img}" alt="Ad" class="mock-vignette-img" onerror="this.style.display='none'"/>
            <h2>${ad.title}</h2>
            <p>${ad.desc}</p>
            <span class="mock-vignette-domain">${ad.domain}</span>
            <div class="mock-vignette-cta">${ad.cta}</div>
          </a>
        </div>
      </div>
    `;

    document.body.appendChild(vignetteAd);

    vignetteAd.querySelector('.mock-vignette-close').addEventListener('click', () => {
      vignetteAd.remove();
    });
  }

  // Inicialização
  window.addEventListener('DOMContentLoaded', () => {
    // Injetar caixas de anúncio
    injectBoxAds();

    // Mostrar anchor ad com delay (simulando carregamento)
    setTimeout(() => {
      injectAnchorAd();
    }, 2000);

    // Observar mutações no DOM (caso os anúncios sejam renderizados depois via JS)
    const observer = new MutationObserver((mutations) => {
      let shouldInject = false;
      for (const m of mutations) {
        if (m.addedNodes.length > 0) {
          shouldInject = true;
          break;
        }
      }
      if (shouldInject) injectBoxAds();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Simular o Vignette Ad aparecendo aleatoriamente depois de um tempo de interação
    // (Por exemplo, após um clique que navega de área)
    document.body.addEventListener('click', (e) => {
      // Evita que cliques dentro do próprio anúncio abram outro
      if (e.target.closest('.mock-vignette-ad')) return;

      // Simular chance de 10% de abrir popup ao clicar em botões/links
      if (e.target.closest('button') || e.target.closest('a')) {
        // Para fins de demonstração, deixarei 30% de chance para aparecer mais frequentemente
        if (Math.random() < 0.3) {
          showVignetteAd();
        }
      }
    });
  });

})();
