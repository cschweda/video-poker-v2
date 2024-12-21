#!/bin/bash

# Directory containing card images
CARDS_DIR="images/cards"

# Create directory if it doesn't exist
mkdir -p "$CARDS_DIR"

# Function to convert card name to simplified format
convert_name() {
    local file=$1
    local basename=$(basename "$file" .png)
    
    # Convert filename format using pattern matching
    case $basename in
        *"ace"*"hearts"* | *"ace_of_hearts"*)
            echo "ah.png" ;;
        *"ace"*"diamonds"* | *"ace_of_diamonds"*)
            echo "ad.png" ;;
        *"ace"*"clubs"* | *"ace_of_clubs"*)
            echo "ac.png" ;;
        *"ace"*"spades"* | *"ace_of_spades"*)
            echo "as.png" ;;
        *"king"*"hearts"* | *"king_of_hearts"*)
            echo "kh.png" ;;
        *"king"*"diamonds"* | *"king_of_diamonds"*)
            echo "kd.png" ;;
        *"king"*"clubs"* | *"king_of_clubs"*)
            echo "kc.png" ;;
        *"king"*"spades"* | *"king_of_spades"*)
            echo "ks.png" ;;
        *"queen"*"hearts"* | *"queen_of_hearts"*)
            echo "qh.png" ;;
        *"queen"*"diamonds"* | *"queen_of_diamonds"*)
            echo "qd.png" ;;
        *"queen"*"clubs"* | *"queen_of_clubs"*)
            echo "qc.png" ;;
        *"queen"*"spades"* | *"queen_of_spades"*)
            echo "qs.png" ;;
        *"jack"*"hearts"* | *"jack_of_hearts"*)
            echo "jh.png" ;;
        *"jack"*"diamonds"* | *"jack_of_diamonds"*)
            echo "jd.png" ;;
        *"jack"*"clubs"* | *"jack_of_clubs"*)
            echo "jc.png" ;;
        *"jack"*"spades"* | *"jack_of_spades"*)
            echo "js.png" ;;
        *"10"*"hearts"* | *"ten_of_hearts"*)
            echo "th.png" ;;
        *"10"*"diamonds"* | *"ten_of_diamonds"*)
            echo "td.png" ;;
        *"10"*"clubs"* | *"ten_of_clubs"*)
            echo "tc.png" ;;
        *"10"*"spades"* | *"ten_of_spades"*)
            echo "ts.png" ;;
        *"2"*"hearts"* | *"two_of_hearts"*)
            echo "2h.png" ;;
        *"2"*"diamonds"* | *"two_of_diamonds"*)
            echo "2d.png" ;;
        *"2"*"clubs"* | *"two_of_clubs"*)
            echo "2c.png" ;;
        *"2"*"spades"* | *"two_of_spades"*)
            echo "2s.png" ;;
        *"3"*"hearts"* | *"three_of_hearts"*)
            echo "3h.png" ;;
        *"3"*"diamonds"* | *"three_of_diamonds"*)
            echo "3d.png" ;;
        *"3"*"clubs"* | *"three_of_clubs"*)
            echo "3c.png" ;;
        *"3"*"spades"* | *"three_of_spades"*)
            echo "3s.png" ;;
        *"4"*"hearts"* | *"four_of_hearts"*)
            echo "4h.png" ;;
        *"4"*"diamonds"* | *"four_of_diamonds"*)
            echo "4d.png" ;;
        *"4"*"clubs"* | *"four_of_clubs"*)
            echo "4c.png" ;;
        *"4"*"spades"* | *"four_of_spades"*)
            echo "4s.png" ;;
        *"5"*"hearts"* | *"five_of_hearts"*)
            echo "5h.png" ;;
        *"5"*"diamonds"* | *"five_of_diamonds"*)
            echo "5d.png" ;;
        *"5"*"clubs"* | *"five_of_clubs"*)
            echo "5c.png" ;;
        *"5"*"spades"* | *"five_of_spades"*)
            echo "5s.png" ;;
        *"6"*"hearts"* | *"six_of_hearts"*)
            echo "6h.png" ;;
        *"6"*"diamonds"* | *"six_of_diamonds"*)
            echo "6d.png" ;;
        *"6"*"clubs"* | *"six_of_clubs"*)
            echo "6c.png" ;;
        *"6"*"spades"* | *"six_of_spades"*)
            echo "6s.png" ;;
        *"7"*"hearts"* | *"seven_of_hearts"*)
            echo "7h.png" ;;
        *"7"*"diamonds"* | *"seven_of_diamonds"*)
            echo "7d.png" ;;
        *"7"*"clubs"* | *"seven_of_clubs"*)
            echo "7c.png" ;;
        *"7"*"spades"* | *"seven_of_spades"*)
            echo "7s.png" ;;
        *"8"*"hearts"* | *"eight_of_hearts"*)
            echo "8h.png" ;;
        *"8"*"diamonds"* | *"eight_of_diamonds"*)
            echo "8d.png" ;;
        *"8"*"clubs"* | *"eight_of_clubs"*)
            echo "8c.png" ;;
        *"8"*"spades"* | *"eight_of_spades"*)
            echo "8s.png" ;;
        *"9"*"hearts"* | *"nine_of_hearts"*)
            echo "9h.png" ;;
        *"9"*"diamonds"* | *"nine_of_diamonds"*)
            echo "9d.png" ;;
        *"9"*"clubs"* | *"nine_of_clubs"*)
            echo "9c.png" ;;
        *"9"*"spades"* | *"nine_of_spades"*)
            echo "9s.png" ;;
        *)
            echo "" ;;
    esac
}

# Process each PNG file in the cards directory
for file in "$CARDS_DIR"/*.png; do
    if [ -f "$file" ]; then
        # Skip already processed files and back.png
        if [[ "$file" =~ ^[a-z0-9][a-z]\.png$ ]] || [ "$(basename "$file")" = "back.png" ]; then
            continue
        fi
        
        # Get new filename
        new_name=$(convert_name "$file")
        
        # Only copy if we got a valid new name
        if [ ! -z "$new_name" ]; then
            cp "$file" "$CARDS_DIR/${new_name}"
            echo "Created: ${new_name} from $(basename "$file")"
        fi
    fi
done

echo "Conversion complete!"
