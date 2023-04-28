// Defines titles, for main-title and sub-title based on hierarchy classes in the DOM
function getSectionsAndSubsections() {
  const mainContent = document.querySelector(".Polaris-Frame__Content_xd1mk");
  const allSections = Array.from(mainContent.querySelectorAll(".pvZ5S"));

  let parentTitle = "";

  return allSections.map((section) => {
    const titleElement = section.querySelector(
      "p.Polaris-DisplayText_1u0t8, p.Polaris-DisplayText--sizeSmall_7647q"
    );
    const subTitleElement = section.querySelector(
      'span[style="font-size: 1.6rem; font-weight: bold;"]'
    );
    const title = titleElement
      ? titleElement.textContent.trim()
      : subTitleElement
      ? subTitleElement.textContent.trim()
      : "";
    const itemType = titleElement
      ? "main-title"
      : subTitleElement
      ? "sub-title"
      : "";
      console.log(`Title: "${title}", ItemType: "${itemType}"`);

    if (itemType === "main-title") {
      parentTitle = title;
    }
    // Count the initial number of criteria to be checked in each sub-title
    const criteriaCount =
      itemType === "sub-title"
        ? section.querySelectorAll(".Polaris-Card__Section_1b1h1").length
        : 0;

    return {
      title,
      itemType,
      parentTitle: itemType === "sub-title" ? parentTitle : "",
      element: section,
      criteriaCount,
    };
  });
}

// Scrolls to section
function scrollToSection(element) {
  if (element) {
    const yOffset = -100; // Offset in pixels
    const yPosition =
      element.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: yPosition, behavior: "smooth" });
  }
}

// Creates the menu and appends all elements to it
function createMenu(sectionsAndSubsections) {
  const menuWrapper = document.createElement("div");
  menuWrapper.id = "menu-wrapper";

  const menu = document.createElement("div");
  menu.className = "fixed-menu";
  menuWrapper.appendChild(menu);

  const reviewify = document.createElement("h1");
  reviewify.textContent = "Click to scroll";
  reviewify.className = "reviewify-title";
  menu.appendChild(reviewify);

  const menuItemsWrapper = document.createElement("div");
  menuItemsWrapper.className = "menu-items-wrapper";
  menu.appendChild(menuItemsWrapper);

  const list = document.createElement("ul");
  list.className = "fixed-menu main-list";
  menu.appendChild(list);

  // Create "Screening summary" menu item to avoid dropdown arrow
  const screeningSummaryItem = document.createElement("li");
  screeningSummaryItem.textContent = "Screening summary";
  screeningSummaryItem.classList.add("menu-item");
  screeningSummaryItem.addEventListener("click", () => {
    const screeningSummaryElement = Array.from(
      document.querySelectorAll("h2")
    ).find((el) => el.textContent === "Screening summary");
    scrollToSection(screeningSummaryElement);
  });

  list.appendChild(screeningSummaryItem);

  sectionsAndSubsections.forEach((item) => {
    if (item.itemType === "main-title") {
      const sectionItem = document.createElement("li");
      sectionItem.classList.add("menu-item", item.itemType);

      const title = document.createElement("span");
      title.textContent = item.title;
      title.classList.add("menu-item-title");
      sectionItem.appendChild(title);

      // Display the counter next to the main title
      const counter = document.createElement("span");
      counter.textContent = item.criteriaCount;
      counter.classList.add("menu-item-counter");
      sectionItem.appendChild(counter);

      // Add a data-section-title attribute to the main title element
      sectionItem.setAttribute("data-section-title", item.title);

      // Check if the item is not the "Screening summary"
      if (item.title !== "Screening summary") {
        const arrowBox = document.createElement("div");
        arrowBox.classList.add("menu-item-arrow-box");
        sectionItem.appendChild(arrowBox);

        const arrow = document.createElement("span");
        arrow.textContent = "▼";
        arrow.classList.add("menu-item-arrow");
        arrowBox.appendChild(arrow);

        // Add click event listener for the title to scroll to section
        title.addEventListener("click", () => {
          scrollToSection(item.element);
        });

        // Add click event listener for the arrow to toggle submenu
        arrowBox.addEventListener("click", (e) => {
          e.stopPropagation();
          sectionItem.classList.toggle("active");
          arrow.textContent = sectionItem.classList.contains("active")
            ? "▲"
            : "▼";
          const subList = sectionItem.querySelector("ul");
          subList.classList.toggle("active");
        });
      } else {
        // If the item is "Screening summary", add the click event listener to scroll to section
        title.addEventListener("click", () => {
          scrollToSection(item.element);
        });
      }

      list.appendChild(sectionItem);

      const subList = document.createElement("ul");
      subList.classList.add("submenu-list");
      sectionItem.appendChild(subList);

      const childSections = sectionsAndSubsections.filter(
        (child) => child.parentTitle === item.title
      );
      childSections.forEach((child) => {
        const subListItem = document.createElement("li");
        subListItem.classList.add("menu-item", child.itemType);

        // Display the counter next to the sub-title
        const counter = document.createElement("span");
        counter.textContent = child.criteriaCount;
        counter.classList.add("menu-item-counter");
        subListItem.appendChild(counter);

        const childTitle = document.createElement("span");
        childTitle.textContent = child.title;
        childTitle.classList.add("menu-item-title");
        subListItem.appendChild(childTitle);

        subListItem.addEventListener("click", (e) => {
          e.stopPropagation();
          scrollToSection(child.element);
        });
        subList.appendChild(subListItem);
      });
    }
  });

  // Create "Internal notes" menu item to avoid dropdown arrow
  const internalNotesItem = document.createElement("li");
  internalNotesItem.textContent = "Internal Notes";
  internalNotesItem.classList.add("menu-item");
  internalNotesItem.addEventListener("click", () =>
    scrollToSection(document.querySelector(".Polaris-Card_yis1o"))
  );

  // Add "Internal Notes" menu item to the bottom of the menu
  list.appendChild(internalNotesItem);

  return menuWrapper;
}

let observerInitialized = false;
let fixedMenu;

function updateMenu() {
  const currentSections = getSectionsAndSubsections();

  if (fixedMenu) {
    fixedMenu.remove();
  }
  fixedMenu = createMenu(currentSections);
  document.body.appendChild(fixedMenu);
}

function injectStyles(url) {
  const link = document.createElement("link");
  link.href = url;
  link.rel = "stylesheet";
  document.head.appendChild(link);
}

function initObserver() {
  if (observerInitialized) return;
  observerInitialized = true;

  injectStyles(chrome.runtime.getURL("styles.css"));

  const observer = new MutationObserver((mutationsList) => {
    const mainContent = document.querySelector(
      ".Polaris-Layout__Section_1b1h1"
    );

    if (mainContent) {
      updateMenu();

      observer.disconnect();

      const contentObserver = new MutationObserver((mutationsList) => {
        updateMenu(mutationsList);
      });

      contentObserver.observe(mainContent, { childList: true, subtree: true });
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

function updateCounter(sectionTitle, change) {
  console.log(`Updating counter for section title: "${sectionTitle}"`);
  const menuItems = document.querySelectorAll(".menu-item.sub-title");

  const menuItem = Array.from(menuItems).find((item) => {
    const itemTitle = item.querySelector(".menu-item-title").textContent;
    return itemTitle === sectionTitle;
  });

  if (!menuItem) {
    console.log(`Menu item not found for section title: "${sectionTitle}". Length: ${sectionTitle.length}, Characters: [${[...sectionTitle].map(c => `${c.charCodeAt(0)}`).join(', ')}]`);
    return;
  }

  const counter = menuItem.querySelector(".menu-item-counter");
  const newCount = parseInt(counter.textContent) + change;
  counter.textContent = newCount;
}

function handleButtonClick(button) {
  const subTitleElement = button.closest(".pvZ5S").querySelector(
    'span[style="font-size: 1.6rem; font-weight: bold;"]'
  );
  const subTitle = subTitleElement.textContent;

  const isActive = button.getAttribute("aria-pressed") === "true";
  console.log(`isActive: ${isActive}`);

  const isInactive = button.getAttribute("aria-pressed") === "false";
  console.log(`isInactive: ${isInactive}`);

  if (isActive && isInactive) {
    button.click();
  }

  button.setAttribute("aria-pressed", !isActive);

  const change = !isActive ? -1 : 1;
  console.log(`change: ${change}`);

  updateCounter(subTitle, change);
}

document.addEventListener("click", (event) => {

  const passButton = event.target.closest(".Polaris-Button_r99lw.Polaris-Button--primary_7k9zs");
  const failButton = event.target.closest(".Polaris-Button_r99lw.Polaris-Button--destructive_zy6o5");


  if (passButton) {
    console.log(passButton);
    handleButtonClick(passButton, "pass");
  } else if (failButton) {
    console.log(failButton);
    handleButtonClick(failButton, "fail");
  }
});



if (
  /^https:\/\/apps\.shopify\.com\/internal\/v2\/app-submissions\/[\w\d-]+\/screening\//.test(
    window.location.href
  )
) {
  initObserver();
}

function init() {
  updateMenu();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
