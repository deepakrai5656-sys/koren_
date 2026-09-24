import re

with open('scraper.py', 'r', encoding='utf-8') as f:
    content = f.read()

old_make_request = '''    def __init__(self):
        self.base_url = "https://mydramalist.com"
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        }


    async def _make_request(self, url: str) -> Optional[BeautifulSoup]:
        """Make HTTP request and return BeautifulSoup object"""
        try:
            async with AsyncSession(impersonate="chrome110") as session:
                response = await session.get(url, timeout=10)
                response.raise_for_status()
                return BeautifulSoup(response.content, 'html.parser')
        except Exception as e:
            logger.error(f"Request failed for {url}: {str(e)}")
            return None'''

new_make_request = '''    def __init__(self):
        self.base_url = "https://mydramalist.com"
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        }
        self._session = None

    async def _get_session(self) -> AsyncSession:
        if self._session is None:
            self._session = AsyncSession(impersonate="chrome110")
        return self._session

    async def _make_request(self, url: str) -> BeautifulSoup:
        """Make HTTP request and return BeautifulSoup object"""
        try:
            session = await self._get_session()
            response = await session.get(url, timeout=10)
            response.raise_for_status()
            return BeautifulSoup(response.content, 'html.parser')
        except Exception as e:
            logger.error(f"Request failed for {url}: {str(e)}")
            raise'''

content = content.replace(old_make_request, new_make_request)

content = re.sub(r'^[ \t]*if not soup:\n[ \t]+(?:return.*|break)\n', '', content, flags=re.MULTILINE)

old_rec = '''            rec_items = soup.select("div.box-body.b-t")
            if not rec_items:
                # Fallback check if no items found with b-t class
                rec_items = soup.select("div.box:has(b a)")
                if not rec_items:
                    break'''
new_rec = '''            rec_items = soup.select("div.box-body.b-t")
            if not rec_items:
                break'''
content = content.replace(old_rec, new_rec)

old_loop = '''            for item in drama_items:
                try:
                    title_elem = item.select_one('h2.title > a')
                    if not title_elem:
                        continue
                    
                    drama_title = title_elem.get_text(strip=True)
                    link = title_elem['href']'''
new_loop = '''            for item in drama_items:
                try:
                    drama_title_elem = item.select_one('h2.title > a')
                    if not drama_title_elem:
                        continue
                    
                    drama_title = drama_title_elem.get_text(strip=True)
                    link = drama_title_elem['href']'''
content = content.replace(old_loop, new_loop)

old_day = "day_header = soup.find('h2', string=day)"
new_day = "day_header = soup.find('h2', string=lambda t: t and day in t)"
content = content.replace(old_day, new_day)

with open('scraper.py', 'w', encoding='utf-8') as f:
    f.write(content)
print('Patch successful.')
