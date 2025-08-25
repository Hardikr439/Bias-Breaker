import os
import sys
import pandas as pd
from datetime import datetime
from fake_headers import Headers
from time import sleep
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.common.exceptions import NoSuchElementException, StaleElementReferenceException, WebDriverException
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.chrome.service import Service as ChromeService
from webdriver_manager.chrome import ChromeDriverManager

# Progress class
class Progress:
    def __init__(self, current, total) -> None:
        self.current = current
        self.total = total
    def print_progress(self, current) -> None:
        self.current = current
        progress = current / self.total
        bar_length = 40
        progress_bar = (
            "[" + "=" * int(bar_length * progress) + "-" * (bar_length - int(bar_length * progress)) + "]"
        )
        sys.stdout.write(
            "\rProgress: [{:<40}] {:.2%} {} of {}".format(progress_bar, progress, current, self.total)
        )
        sys.stdout.flush()

# Scroller class
class Scroller:
    def __init__(self, driver) -> None:
        self.driver = driver
        self.current_position = 0
        self.last_position = driver.execute_script("return window.pageYOffset;")
        self.scrolling = True
        self.scroll_count = 0
    def reset(self) -> None:
        self.current_position = 0
        self.last_position = self.driver.execute_script("return window.pageYOffset;")
        self.scroll_count = 0
    def scroll_to_top(self) -> None:
        self.driver.execute_script("window.scrollTo(0, 0);")
    def scroll_to_bottom(self) -> None:
        self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
    def update_scroll_position(self) -> None:
        self.current_position = self.driver.execute_script("return window.pageYOffset;")

# Tweet class
class Tweet:
    def __init__(self, card, driver, actions, scrape_poster_details=False) -> None:
        self.card = card
        self.error = False
        self.tweet = None
        try:
            self.user = card.find_element("xpath", './/div[@data-testid="User-Name"]//span').text
        except NoSuchElementException:
            self.error = True
            self.user = "skip"
        try:
            self.handle = card.find_element("xpath", './/span[contains(text(), "@")]').text
        except NoSuchElementException:
            self.error = True
            self.handle = "skip"
        try:
            self.date_time = card.find_element("xpath", ".//time").get_attribute("datetime")
            if self.date_time is not None:
                self.is_ad = False
        except NoSuchElementException:
            self.is_ad = True
            self.error = True
            self.date_time = "skip"
        if self.error:
            return
        try:
            card.find_element("xpath", './/*[local-name()="svg" and @data-testid="icon-verified"]')
            self.verified = True
        except NoSuchElementException:
            self.verified = False
        self.content = ""
        contents = card.find_elements("xpath", '(.//div[@data-testid="tweetText"])[1]/span | (.//div[@data-testid="tweetText"])[1]/a')
        for content in contents:
            self.content += content.text
        try:
            self.reply_cnt = card.find_element("xpath", './/div[@data-testid="reply"]//span').text
            if self.reply_cnt == "":
                self.reply_cnt = "0"
        except NoSuchElementException:
            self.reply_cnt = "0"
        try:
            self.retweet_cnt = card.find_element("xpath", './/div[@data-testid="retweet"]//span').text
            if self.retweet_cnt == "":
                self.retweet_cnt = "0"
        except NoSuchElementException:
            self.retweet_cnt = "0"
        try:
            self.like_cnt = card.find_element("xpath", './/div[@data-testid="like"]//span').text
            if self.like_cnt == "":
                self.like_cnt = "0"
        except NoSuchElementException:
            self.like_cnt = "0"
        try:
            self.analytics_cnt = card.find_element("xpath", './/a[contains(@href, "/analytics")]//span').text
            if self.analytics_cnt == "":
                self.analytics_cnt = "0"
        except NoSuchElementException:
            self.analytics_cnt = "0"
        try:
            self.tags = card.find_elements("xpath", './/a[contains(@href, "src=hashtag_click")]')
            self.tags = [tag.text for tag in self.tags]
        except NoSuchElementException:
            self.tags = []
        try:
            self.mentions = card.find_elements("xpath", '(.//div[@data-testid="tweetText"])[1]//a[contains(text(), "@")]')
            self.mentions = [mention.text for mention in self.mentions]
        except NoSuchElementException:
            self.mentions = []
        try:
            raw_emojis = card.find_elements("xpath", '(.//div[@data-testid="tweetText"])[1]/img[contains(@src, "emoji")]')
            self.emojis = [emoji.get_attribute("alt").encode("unicode-escape").decode("ASCII") for emoji in raw_emojis]
        except NoSuchElementException:
            self.emojis = []
        try:
            self.profile_img = card.find_element("xpath", './/div[@data-testid="Tweet-User-Avatar"]//img').get_attribute("src")
        except NoSuchElementException:
            self.profile_img = ""
        try:
            self.tweet_link = self.card.find_element("xpath", ".//a[contains(@href, '/status/')]").get_attribute("href")
            self.tweet_id = str(self.tweet_link.split("/")[-1])
        except NoSuchElementException:
            self.tweet_link = ""
            self.tweet_id = ""
        self.tweet = (
            self.user,
            self.handle,
            self.date_time,
            self.verified,
            self.content,
            self.reply_cnt,
            self.retweet_cnt,
            self.like_cnt,
            self.analytics_cnt,
            self.tags,
            self.mentions,
            self.emojis,
            self.profile_img,
            self.tweet_link,
            self.tweet_id
        )

# Twitter Scraper class
TWITTER_LOGIN_URL = "https://twitter.com/i/flow/login"
class Twitter_Scraper:
    def __init__(self, username, password, max_tweets=50, scrape_username=None, scrape_hashtag=None, scrape_query=None, scrape_poster_details=False, scrape_latest=False, scrape_top=True):
        print("[INFO] Initializing Twitter_Scraper...")
        self.username = username
        self.password = password
        self.interrupted = False
        self.tweet_ids = set()
        self.data = []
        self.tweet_cards = []
        self.scraper_details = {
            "type": None,
            "username": None,
            "hashtag": None,
            "query": None,
            "tab": None,
            "poster_details": False,
        }
        self.max_tweets = max_tweets
        self.progress = Progress(0, max_tweets)
        self.router = self.go_to_home
        print("[INFO] Setting up WebDriver...")
        self.driver = self._get_driver()
        self.actions = ActionChains(self.driver)
        self.scroller = Scroller(self.driver)
        self._config_scraper(max_tweets, scrape_username, scrape_hashtag, scrape_query, scrape_latest, scrape_top, scrape_poster_details)
    def _config_scraper(self, max_tweets=50, scrape_username=None, scrape_hashtag=None, scrape_query=None, scrape_latest=True, scrape_top=False, scrape_poster_details=False):
        self.tweet_ids = set()
        self.data = []
        self.tweet_cards = []
        self.max_tweets = max_tweets
        self.progress = Progress(0, max_tweets)
        self.scraper_details = {
            "type": None,
            "username": scrape_username,
            "hashtag": str(scrape_hashtag).replace("#", "") if scrape_hashtag is not None else None,
            "query": scrape_query,
            "tab": "Latest" if scrape_latest else "Top" if scrape_top else "Latest",
            "poster_details": scrape_poster_details,
        }
        self.router = self.go_to_home
        self.scroller = Scroller(self.driver)
        if scrape_username is not None:
            self.scraper_details["type"] = "Username"
            self.router = self.go_to_profile
        elif scrape_hashtag is not None:
            self.scraper_details["type"] = "Hashtag"
            self.router = self.go_to_hashtag
        elif scrape_query is not None:
            self.scraper_details["type"] = "Query"
            self.router = self.go_to_search
        else:
            self.scraper_details["type"] = "Home"
            self.router = self.go_to_home
    def _get_driver(self):
        print("[INFO] Creating Chrome WebDriver instance...")
        header = Headers().generate()["User-Agent"]
        browser_option = ChromeOptions()
        browser_option.add_argument("--no-sandbox")
        browser_option.add_argument("--disable-dev-shm-usage")
        browser_option.add_argument("--ignore-certificate-errors")
        browser_option.add_argument("--disable-gpu")
        browser_option.add_argument("--log-level=3")
        browser_option.add_argument("--disable-notifications")
        browser_option.add_argument("--disable-popup-blocking")
        browser_option.add_argument(f"--user-agent={header}")
        browser_option.add_argument("--headless")
        try:
            driver = webdriver.Chrome(options=browser_option)
            return driver
        except WebDriverException:
            chromedriver_path = ChromeDriverManager().install()
            chrome_service = ChromeService(executable_path=chromedriver_path)
            driver = webdriver.Chrome(service=chrome_service, options=browser_option)
            return driver
    def login(self):
        print("[INFO] Starting login process...")
        self.driver.maximize_window()
        self.driver.get(TWITTER_LOGIN_URL)
        sleep(3)
        self._input_username()
        self._input_unusual_activity()
        self._input_password()
        print("[INFO] Login process completed.")
    def _input_username(self):
        input_attempt = 0
        while True:
            try:
                username = self.driver.find_element("xpath", "//input[@autocomplete='username']")
                username.send_keys(self.username)
                username.send_keys(Keys.RETURN)
                sleep(3)
                break
            except NoSuchElementException:
                input_attempt += 1
                if input_attempt >= 3:
                    self.driver.quit()
                    sys.exit(1)
                else:
                    sleep(2)
    def _input_unusual_activity(self):
        input_attempt = 0
        while True:
            try:
                unusual_activity = self.driver.find_element("xpath", "//input[@data-testid='ocfEnterTextTextInput']")
                unusual_activity.send_keys(self.username)
                unusual_activity.send_keys(Keys.RETURN)
                sleep(3)
                break
            except NoSuchElementException:
                input_attempt += 1
                if input_attempt >= 3:
                    break
    def _input_password(self):
        input_attempt = 0
        while True:
            try:
                password = self.driver.find_element("xpath", "//input[@autocomplete='current-password']")
                password.send_keys(self.password)
                password.send_keys(Keys.RETURN)
                sleep(3)
                break
            except NoSuchElementException:
                input_attempt += 1
                if input_attempt >= 3:
                    self.driver.quit()
                    sys.exit(1)
                else:
                    sleep(2)
    def go_to_home(self):
        print("[INFO] Navigating to Twitter Home page...")
        self.driver.get("https://twitter.com/home")
        sleep(3)
    def go_to_profile(self):
        print(f"[INFO] Navigating to profile: {self.scraper_details['username']}")
        if self.scraper_details["username"] is None or self.scraper_details["username"] == "":
            sys.exit(1)
        else:
            self.driver.get(f"https://twitter.com/{self.scraper_details['username']}")
            sleep(3)
    def go_to_hashtag(self):
        print(f"[INFO] Navigating to hashtag: {self.scraper_details['hashtag']}")
        if self.scraper_details["hashtag"] is None or self.scraper_details["hashtag"] == "":
            sys.exit(1)
        else:
            url = f"https://twitter.com/hashtag/{self.scraper_details['hashtag']}?src=hashtag_click"
            if self.scraper_details["tab"] == "Latest":
                url += "&f=live"
            self.driver.get(url)
            sleep(3)
    def go_to_search(self):
        print(f"[INFO] Navigating to search query: {self.scraper_details['query']}")
        if self.scraper_details["query"] is None or self.scraper_details["query"] == "":
            sys.exit(1)
        else:
            url = f"https://twitter.com/search?q={self.scraper_details['query']}&src=typed_query"
            if self.scraper_details["tab"] == "Latest":
                url += "&f=live"
            self.driver.get(url)
            sleep(1)
    def get_tweet_cards(self):
        self.tweet_cards = self.driver.find_elements("xpath", '//article[@data-testid="tweet" and not(@disabled)]')
    def remove_hidden_cards(self):
        try:
            hidden_cards = self.driver.find_elements("xpath", '//article[@data-testid="tweet" and @disabled]')
            for card in hidden_cards[1:-2]:
                self.driver.execute_script("arguments[0].parentNode.parentNode.parentNode.remove();", card)
        except Exception:
            return
    def scrape_tweets(self, max_tweets=50, scrape_username=None, scrape_hashtag=None, scrape_query=None, scrape_latest=True, scrape_top=False, scrape_poster_details=False, router=None):
        import random
        print("[INFO] Starting tweet scraping loop...")
        self._config_scraper(max_tweets, scrape_username, scrape_hashtag, scrape_query, scrape_latest, scrape_top, scrape_poster_details)
        if router is None:
            router = self.router
        router()
        self.progress.print_progress(0)
        refresh_count = 0
        added_tweets = 0
        empty_count = 0
        no_new_tweets_attempts = 0
        last_data_len = 0
        max_no_new_tweets_attempts = 10  # Stop after 10 attempts with no new tweets
        while self.scroller.scrolling:
            try:
                print(f"[DEBUG] Scrolling... Current tweets collected: {len(self.data)}")
                self.get_tweet_cards()
                added_tweets = 0
                for card in self.tweet_cards[-20:]:  # Check more cards per scroll
                    try:
                        tweet_id = str(card)
                        if tweet_id not in self.tweet_ids:
                            self.tweet_ids.add(tweet_id)
                            if not self.scraper_details["poster_details"]:
                                self.driver.execute_script("arguments[0].scrollIntoView();", card)
                            tweet = Tweet(card=card, driver=self.driver, actions=self.actions, scrape_poster_details=self.scraper_details["poster_details"])
                            if tweet:
                                if not tweet.error and tweet.tweet is not None:
                                    if not tweet.is_ad:
                                        self.data.append(tweet.tweet)
                                        added_tweets += 1
                                        self.progress.print_progress(len(self.data))
                                        print(f"[DEBUG] Added tweet {len(self.data)}")
                                        sleep(random.uniform(0.2, 0.6))  # Short, random sleep
                                        if len(self.data) >= self.max_tweets:
                                            self.scroller.scrolling = False
                                            break
                                    else:
                                        continue
                                else:
                                    continue
                            else:
                                continue
                        else:
                            continue
                    except NoSuchElementException:
                        continue
                if len(self.data) >= self.max_tweets:
                    print("[INFO] Reached max tweets. Stopping scrape.")
                    break
                if len(self.data) == last_data_len:
                    no_new_tweets_attempts += 1
                else:
                    no_new_tweets_attempts = 0
                last_data_len = len(self.data)
                if no_new_tweets_attempts >= max_no_new_tweets_attempts:
                    break  # Stop if no new tweets for several scrolls
                if added_tweets == 0:
                    if empty_count >= 3:
                        if refresh_count >= 2:
                            break
                        refresh_count += 1
                    empty_count += 1
                    sleep(random.uniform(2.5, 4.5))  # Randomized longer sleep
                else:
                    empty_count = 0
                    refresh_count = 0
                # Aggressive but randomized scrolling
                scroll_pause = random.uniform(0.5, 1.2)
                self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                sleep(scroll_pause)
            except StaleElementReferenceException:
                print("[WARN] StaleElementReferenceException encountered. Retrying...")
                sleep(random.uniform(2, 4))
                continue
            except KeyboardInterrupt:
                print("[INFO] KeyboardInterrupt detected. Stopping scrape.")
                self.interrupted = True
                break
            except Exception as e:
                print(f"[ERROR] Exception occurred: {e}")
                break
        print(f"[INFO] Scraping finished. Total tweets collected: {len(self.data)}")
    def get_tweets(self):
        return self.data
