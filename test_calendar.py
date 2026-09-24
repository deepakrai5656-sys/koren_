import asyncio
from scraper import MyDramaListScraper

async def main():
    print("Testing /api/calendar scraper method...\n")
    scraper = MyDramaListScraper()
    result = await scraper.get_airing_calendar()
    
    if not result:
        print("Failed to fetch calendar data.")
        return

    print(f"Total dramas found: {result['total']}")
    
    days = [day for day, dramas in result['days'].items() if dramas]
    print(f"Days found with dramas: {days}")
    
    for day in days:
        print(f"\nSample drama from {day}:")
        sample = result['days'][day][0]
        for key, value in sample.items():
            print(f"  {key}: {value}")
        break  # Only print one sample from any non-empty day

if __name__ == "__main__":
    asyncio.run(main())
