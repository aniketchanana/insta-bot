const {
  Builder,
  By,
  Key,
  until
} = require('selenium-webdriver');

const {
  USERNAME,
  PASSWORD,
  BASE_URL,
  FOLLOWER_SELECTOR,
  FOLLOWING_SELECTOR
} = require('./constants');

const driver = new Builder()
  .forBrowser('chrome')
  .build();

function nullCheck(value) {
  return value === '' || value === undefined || value === null;
}

async function login() {
  await driver.wait(until.elementLocated(By.name('username')));
  await driver.findElement(By.name('username')).sendKeys(USERNAME);
  await driver.findElement(By.name('password')).sendKeys(PASSWORD, Key.RETURN);
  await driver.wait(until.elementLocated(By.css('[data-testid=user-avatar]')));
  console.log(`--logged into account ${USERNAME}--`);
}

async function getNumbers() {
  const follower = await (await driver).findElement(By.css(FOLLOWER_SELECTOR)).getText();
  const following = await (await driver).findElement(By.css(FOLLOWING_SELECTOR)).getText();

  console.log(`${USERNAME} has ${follower} ${following}`);

  return [parseInt(follower), parseInt(following)];
}

async function getFollowersList(totalFollowers) {
  (await (await driver).findElement(By.css(FOLLOWER_SELECTOR))).click();
  let tempListOfFollowers = [];
  while (tempListOfFollowers.length === 0) {
    tempListOfFollowers = await (await driver).findElements(By.css('[role=dialog] li'));
  };
  while (tempListOfFollowers.length !== totalFollowers) {
    driver.executeScript("arguments[0].scrollIntoView(true);", tempListOfFollowers[tempListOfFollowers.length - 1]);
    const tempLen = tempListOfFollowers.length;
    while (tempListOfFollowers.length === tempLen) {
      tempListOfFollowers = await (await driver).findElements(By.css('[role=dialog] li'));
    }
  }
  const allElements = (await driver).findElements(By.css('[role=dialog] span'));

  return Promise.all((await allElements).map(ele => {
    return ele.getText();
  }));
}

async function getFollowingList(totalFollowing) {
  (await (await driver).findElement(By.css(FOLLOWING_SELECTOR))).click();
  let tempListOfFollowing = [];
  while (tempListOfFollowing.length === 0) {
    tempListOfFollowing = await (await driver).findElements(By.css('[role=dialog] li'));
  };
  while (tempListOfFollowing.length !== totalFollowing) {
    driver.executeScript("arguments[0].scrollIntoView(true);", tempListOfFollowing[tempListOfFollowing.length - 1]);
    const tempLen = tempListOfFollowing.length;
    while (tempListOfFollowing.length === tempLen) {
      tempListOfFollowing = await (await driver).findElements(By.css('[role=dialog] li'));
    }
  }
  const allElements = (await driver).findElements(By.css('[role=dialog] span'));
  return Promise.all((await allElements).map(ele => {
    return ele.getText();
  }));
}

async function main() {
  try {
    driver.get(BASE_URL);

    await login();

    driver.get(`${BASE_URL}${USERNAME}`);

    const [followers, following] = await getNumbers();

    const followersList = await getFollowersList(followers);
    driver.get(`${BASE_URL}${USERNAME}`);
    const followingList = await getFollowingList(following);

    const followerUserName = [];
    let followerSet = new Set();
    followersList.forEach((e, i) => {
      if (!nullCheck(e.trim())) {
        followerSet.add(e);
      }
    });

    const followingUserName = [];
    let followingSet = new Set();
    followingList.forEach((e, i) => {
      if (!nullCheck(e.trim())) {
        followingSet.add(e);
      }
    });

    followerSet.forEach(e => {
      followerUserName.push(e);
    });
    followingSet.forEach(e => {
      followingUserName.push(e);
    });

    console.log(followerUserName);
    console.log(followerUserName.length);
    console.log(followingUserName);
    console.log(followingUserName.length);
  } catch (e) {
    console.log(e);
    (await driver).quit();
  }
}

main();