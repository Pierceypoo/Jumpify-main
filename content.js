function getSectionsAndSubsections() {
  const mainContent = document.querySelector(".Polaris-Frame__Content_xd1mk");
  const allSections = Array.from(mainContent.querySelectorAll(".pvZ5S"));

  let parentTitle = "";

  return allSections.map((section, index) => { // Add the 'index' parameter here
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

    if (itemType === "main-title") {
      parentTitle = title;
    }

    section.id = `section-${index}`; // This line is in the correct spot

    return {
      title,
      itemType,
      parentTitle: itemType === "sub-title" ? parentTitle : "",
      element: section,
      id: section.id,
    };
  });
}

/* Scrolls to section */
function scrollToSection(element) {
  if (element) {
    const yOffset = -100; // Offset in pixels
    const yPosition =
      element.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: yPosition, behavior: "smooth" });
  }
}

/* Initializes counter when page loads for each sub titles */
function setInitialCounterValues(clickedButtonType = '') {
  const menuItems = document.querySelectorAll(".menu-item");

  menuItems.forEach((menuItem) => {
    const sectionId = menuItem.dataset.sectionId;
    const section = document.getElementById(sectionId);

    if (section) {
      const requirements = section.querySelectorAll(".Polaris-Card__Section_1b1h1");
      let counterValue = 0;

      requirements.forEach((requirement) => {
        const passButton = requirement.querySelector(".Polaris-Button--primary_7k9zs");
        const failButton = requirement.querySelector(".Polaris-Button--destructive_zy6o5");

        // Update the filter condition depending on which button is clicked
        if (clickedButtonType === 'Pass') {
          if (!failButton && passButton && !passButton.disabled) {
            counterValue++;
          }
        } else if (clickedButtonType === 'Fail') {
          if (!passButton && failButton && !failButton.disabled) {
            counterValue++;
          }
        } else {
          if (!passButton && !failButton) {
            counterValue++;
          }
        }
      });

      const counter = menuItem.querySelector(".menu-item-counter");
      if (counter) {
        counter.textContent = counterValue;
      }
    }
  });

  // Update the main title counter initially
  const mainTitleMenuItems = document.querySelectorAll(".main-title");
  mainTitleMenuItems.forEach((mainTitleMenuItem) => {
    const mainCounter = mainTitleMenuItem.querySelector(".menu-item-counter");
    if (mainCounter) {
      const subTitleCounters = mainTitleMenuItem.querySelectorAll(".sub-title .menu-item-counter");
      const mainCounterValue = Array.from(subTitleCounters).reduce((sum, counter) => {
        const counterValue = parseInt(counter.textContent, 10);
        return sum + (isNaN(counterValue) ? 0 : counterValue);
      }, 0);

      mainCounter.textContent = mainCounterValue;
    }
  });
}

attachButtonListeners();
setInitialCounterValues();

/* Updates counter based on pass or fail */
function updateCounter(clickedButton) {
  const section = clickedButton.closest(".pvZ5S");
  if (section) {
    const sectionId = section.id;
    const menuItem = document.querySelector(`.menu-item[data-section-id="${sectionId}"]`);
    const counter = menuItem.querySelector(".menu-item-counter");

    if (counter) {
      const requirements = section.querySelectorAll(".Polaris-Card__Section_1b1h1");
      const unclickedRequirements = Array.from(requirements).filter((requirement) => {
        const buttons = requirement.querySelectorAll("button");
        return Array.from(buttons).some((button) => !button.disabled);
      });

      counter.textContent = unclickedRequirements.length;
    }
  }
}

function attachButtonListeners() {
  const buttonGroups = document.querySelectorAll(".Polaris-ButtonGroup_yy85z.Polaris-ButtonGroup--segmented_150jh");

  buttonGroups.forEach((buttonGroup) => {
    buttonGroup.addEventListener("click", (event) => {
      const clickedButton = event.target.closest("button");

      if (!clickedButton) {
        return;
      }

      const buttons = buttonGroup.querySelectorAll("button");

      buttons.forEach((button) => {
        button.disabled = button !== clickedButton;
      });

      updateCounter(clickedButton);
    });
  });
}

/* Creates the menu and appends all elements to it */
function createMenu(sectionsAndSubsections) {
  const menuWrapper = document.createElement("div");
  menuWrapper.id = "menu-wrapper";

  const menu = document.createElement("div");
  menu.className = "fixed-menu";
  menuWrapper.appendChild(menu);

  const reviewifyImage = document.createElement("div");
  reviewifyImage.className = "reviewify-image";
  reviewifyImage.style.backgroundImage = `url(${chrome.runtime.getURL(
    "robot128.png"
  )})`;
  menu.appendChild(reviewifyImage);

  const reviewify = document.createElement("h1");
  reviewify.textContent = "Reviewify";
  reviewify.className = "reviewify-title";
  menu.appendChild(reviewify);

  const menuItemsWrapper = document.createElement("div");
  menuItemsWrapper.className = "menu-items-wrapper";
  menu.appendChild(menuItemsWrapper);

  const list = document.createElement("ul");
  list.className = "fixed-menu main-list";
  menu.appendChild(list);

  /* Create "Screening summary" menu item to avoid dropdown arrow */
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

      const counter = document.createElement("span"); // Add the counter element
      counter.className = "menu-item-counter";
      sectionItem.appendChild(counter);

      const title = document.createElement("span");
      title.textContent = item.title;
      title.classList.add("menu-item-title");
      sectionItem.appendChild(title);

      const childSections = sectionsAndSubsections.filter(
        (child) => child.parentTitle === item.title
      );

      let totalCount = 0;
      childSections.forEach((child) => {
        totalCount += child.element.querySelectorAll(
          ".Polaris-ButtonGroup_yy85z.Polaris-ButtonGroup--segmented_150jh button"
        ).length;
      });

      counter.textContent = totalCount / 2;

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

// In the forEach loop for childSections
childSections.forEach((child) => {
  const subListItem = document.createElement("li");
  subListItem.textContent = child.title;
  subListItem.setAttribute("data-section-id", child.id);
  subListItem.classList.add("menu-item", child.itemType);
  subListItem.setAttribute("data-section-id", child.element.id); // Add the data attribute

  const counter = document.createElement("span"); // Add the counter element
  counter.className = "menu-item-counter";
  subListItem.appendChild(counter);

  subListItem.addEventListener("click", (e) => {
    e.stopPropagation();
    scrollToSection(child.element);
  });

  subList.appendChild(subListItem);

  // Update the counter initially
  updateCounter(subListItem);
});
    }
  });

  /* Create "Internal notes" menu item to avoid dropdown arrow */
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
  setInitialCounterValues();
  attachButtonListeners();
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
        updateMenu();
      });

      contentObserver.observe(mainContent, { childList: true, subtree: true });
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

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
