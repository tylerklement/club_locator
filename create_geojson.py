import os, csv
creds = ''
with open('creds.txt', 'r', encoding='utf-8') as cred_f:
    creds = next(cred_f).strip()
os.environ["GOOGLE_API_KEY"] = creds
import geocoder

states = {pair[1]: pair[0] for pair in [
    ('AL', 'Alabama'),
    ('AK', 'Alaska'),
    ('AZ', 'Arizona'),
    ('AR', 'Arkansas'),
    ('CA', 'California'),
    ('CO', 'Colorado'),
    ('CT', 'Connecticut'),
    ('DE', 'Delaware'),
    ('FL', 'Florida'),
    ('GA', 'Georgia'),
    ('HI', 'Hawaii'),
    ('ID', 'Idaho'),
    ('IL', 'Illinois'),
    ('IN', 'Indiana'),
    ('IA', 'Iowa'),
    ('KS', 'Kansas'),
    ('KY', 'Kentucky'),
    ('LA', 'Louisiana'),
    ('ME', 'Maine'),
    ('MD', 'Maryland'),
    ('MA', 'Massachusetts'),
    ('MI', 'Michigan'),
    ('MN', 'Minnesota'),
    ('MS', 'Mississippi'),
    ('MO', 'Missouri'),
    ('MT', 'Montana'),
    ('NE', 'Nebraska'),
    ('NV', 'Nevada'),
    ('NH', 'New Hampshire'),
    ('NJ', 'New Jersey'),
    ('NM', 'New Mexico'),
    ('NY', 'New York'),
    ('NC', 'North Carolina'),
    ('ND', 'North Dakota'),
    ('OH', 'Ohio'),
    ('OK', 'Oklahoma'),
    ('OR', 'Oregon'),
    ('PA', 'Pennsylvania'),
    ('RI', 'Rhode Island'),
    ('SC', 'South Carolina'),
    ('SD', 'South Dakota'),
    ('TN', 'Tennessee'),
    ('TX', 'Texas'),
    ('UT', 'Utah'),
    ('VT', 'Vermont'),
    ('VA', 'Virginia'),
    ('WA', 'Washington'),
    ('WV', 'West Virginia'),
    ('WI', 'Wisconsin'),
    ('WY', 'Wyoming')
]}

data = {}

def create_csv():
    num_addresses = 0
    with open('clubs.csv', 'w', encoding='utf-8') as csv_f:
        writer = csv.writer(csv_f)
        writer.writerow(['state', 'club_name', 'address1', 'city', 'state_short', 'zipcode', 'contact_name', 'contact_email', 'contact_phone', 'match_date', 'geocode_address', 'latitude', 'longitude'])
        with open('clubs.txt', 'r', encoding='utf-8') as club_f:
            next(club_f)
            for line in club_f:
                state = line.strip()
                next(club_f)
                line = next(club_f).strip()
                # iterate through each club
                while line != '+++++++++++++':
                    club_name = line
                    print('club_name\n\t', club_name)

                    address1 = next(club_f).strip()
                    address2 = next(club_f).strip()
                    city = address2[:address2.rindex(',')].strip()
                    state_short = address2[address2.rindex(',')+2:address2.rindex(' ')].strip()
                    zipcode = address2[address2.rindex(' '):].strip()
                    next(club_f) # skip locate on map
                    contact_name = next(club_f).strip()
                    contact_email = next(club_f).strip()
                    contact_phone = next(club_f).strip()
                    match_date = next(club_f).strip()[15:]

                    #print('address1\n\t', address1)
                    #print('city\n\t', city)
                    #print('state\n\t', state_short)
                    #print('zip\n\t', zipcode)
                    #print('name\n\t', contact_name)
                    #print('email\n\t', contact_email)
                    #print('phone\n\t', contact_phone)
                    #print('match_date\n\t', match_date)

                    geocode_address = ''

                    if address1 != 'N/A':
                        geocode_address += address1 + ', '
                    if city != 'N/A':
                        geocode_address += city + ', '
                    geocode_address += state_short + ' '
                    if zipcode != 'N/A':
                        geocode_address += zipcode

                    #print('geocode_address', geocode_address)

                    geo = geocoder.google(geocode_address)
                    writer.writerow([state, club_name, address1, city, state_short, zipcode, contact_name, contact_email, contact_phone, match_date, geocode_address, geo.latlng[0], geo.latlng[1]])
                    num_addresses += 1

                    line = next(club_f).strip()

    print("Num addresses written:", num_addresses)
create_csv()
#geo = geocoder.google(geocode_address)
#latlong = geo.latlng
