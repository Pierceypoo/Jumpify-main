function createMenu() {
  const menu = document.createElement("div");
  menu.id = "fixed-menu";

  const menuItems = [
    {
      title: "Core criteria",
      fontSize: "1.25rem",
      subsections: [
        { title: "App checks", fontSize: "1.6rem" },
        { title: "Authentication", fontSize: "1.6rem" },
        { title: "Billing API", fontSize: "1.6rem" },
        { title: "Submission requirements", fontSize: "1.6rem" },
        { title: "Prohibited app type", fontSize: "1.6rem" },
      ],
    },
    {
      title: "App listing",
      fontSize: "1.25rem",
      subsections: [
        { title: "Branding", fontSize: "1.6rem" },
        { title: "Descriptions", fontSize: "1.6rem" },
        { title: "Images and video", fontSize: "1.6rem" },
        { title: "Pricing plans", fontSize: "1.6rem" },
        { title: "App discovery content", fontSize: "1.6rem" },
      ],
    },
    {
      title: "App functionality",
      fontSize: "1.25rem",
      subsections: [
        { title: "Merchant setup and workflows", fontSize: "1.6rem" },
        { title: "Security", fontSize: "1.6rem" },
        { title: "Risk", fontSize: "1.6rem" },
        { title: "Billing", fontSize: "1.6rem" },
        { title: "Re-installation", fontSize: "1.6rem" },
      ],
    },
    {
      title: "Uncategorized",
      fontSize: "1.25rem",
      subsections: [
        { title: "Uncategorized errors and criteria", fontSize: "1.6rem" },
      ],
    }
    // Add other section items here with their respective subsections...
  ];

  const list = document.createElement("ul");
  menu.appendChild(list);

  menuItems.forEach((sectionItem) => {
    const listItem = document.createElement("li");
    listItem.textContent = sectionItem.title;
    listItem.addEventListener("click", () => {
      const targetElement = getElementByTextAndSize(sectionItem.title, sectionItem.fontSize);
      if (targetElement) {
        const yOffset = targetElement.getBoundingClientRect().top + window.pageYOffset - 20;
        window.scrollTo({ top: yOffset, behavior: "smooth" });
      }
    });
    list.appendChild(listItem);

    const subList = document.createElement("ul");
    listItem.appendChild(subList);

    sectionItem.subsections.forEach((subsectionItem) => {
      const subListItem = document.createElement("li");
      subListItem.textContent = subsectionItem.title;
      
      // Indent subsection menu items
      subListItem.style.marginLeft = "20px";

      subListItem.addEventListener("click", (e) => {
        e.stopPropagation();
        const targetElement = getElementByTextAndSize(subsectionItem.title, subsectionItem.fontSize);
        if (targetElement) {
          const yOffset = targetElement.getBoundingClientRect().top + window.pageYOffset - 20;
          window.scrollTo({ top: yOffset, behavior: "smooth" });
        }
      });
      subList.appendChild(subListItem);
    });
  });

  return menu;
}

function getElementByTextAndSize(text, size) {
  const allElements = Array.from(document.querySelectorAll("body *"));
  const targetFontSize = parseFloat(size) * parseFloat(getComputedStyle(document.documentElement).fontSize);
  const matchingElements = allElements.filter((element) => {
    const computedStyle = window.getComputedStyle(element, null);
    const fontSizeInPx = parseFloat(computedStyle.fontSize);
    if (fontSizeInPx === targetFontSize && element.textContent.trim() === text) {
      return true;
    }
    return false;
  });

  if (matchingElements.length > 0) {
    return matchingElements[0];
  }
  return null;
}

let observerInitialized = false;

function initObserver() {
  if (observerInitialized) return;
  observerInitialized = true;

  const observer = new MutationObserver((mutationsList) => {
    if (document.querySelector(".Polaris-Frame__Content_xd1mk")) {
      const fixedMenu = createMenu();
      document.body.appendChild(fixedMenu);
      observer.disconnect();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

if (/^https:\/\/apps\.shopify\.com\/internal\/v2\/app-submissions\/[\w\d-]+\/screening\//.test(window.location.href)){
  initObserver();
}