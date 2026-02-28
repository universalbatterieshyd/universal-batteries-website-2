# Vehicle Database CSV Import

Import vehicles in bulk for the battery finder using CSV files.

## Supported formats

### Simple format (recommended)

| brand | model | fuel_type | segment | capacity_ah |
|-------|-------|-----------|---------|------------|
| Maruti Suzuki | Swift | Petrol | car | 35 |
| Maruti Suzuki | Dzire | Diesel | car | 45 |
| Honda | City | Petrol | car | 35 |

### Zipowatt / Excel format

| Vehicle Make | Vehicle Segment | Brand + Model | Battery Capacity (AH) | Fuel Types | Notes |
|--------------|-----------------|---------------|----------------------|------------|-------|
| AUDI | CARS | AUDI A3 (Petrol & Diesel), AUDI A4 (Petrol) | 100 | Petrol & Diesel | |
| Maruti Suzuki | CARS | Swift (Petrol), Dzire (Diesel) | 35 | Petrol, Diesel | |

- **Vehicle Segment** maps: CARS→car, SUV→suv, BIKES→bike, TRUCKS→truck, MPV→truck, TRACTOR→tractor
- **Brand + Model** can be comma-separated; each part like `AUDI A3 (Petrol & Diesel)` creates a separate row
- **Fuel Types** is used when not specified in parentheses

## Column aliases

The importer accepts these column names (case-insensitive where applicable):

| Field | Aliases |
|-------|---------|
| brand | brand, Brand, vehicle_make, Vehicle Make, make |
| model | model, Model, brand_model, Brand + Model |
| fuel_type | fuel_type, Fuel Type, Fuel Types, fuel_types |
| segment | segment, Segment, vehicle_segment, Vehicle Segment |
| capacity_ah | capacity_ah, Capacity (AH), Battery Capacity (AH), capacity, Capacity |

## How to import

1. Go to **Admin → Vehicle Database**
2. Click **Import CSV**
3. Select a `.csv` file
4. The page refreshes with imported vehicles

## Duplicate handling

Rows with the same `brand + model + fuel_type` are deduplicated; only the first occurrence is imported.
