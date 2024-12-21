#!/bin/bash

# Get the script's directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Check if images/cards directory exists
if [ ! -d "$SCRIPT_DIR/images/cards" ]; then
    echo "Error: images/cards directory not found!"
    echo "Current directory: $(pwd)"
    exit 1
fi

# Change to the correct directory
cd "$SCRIPT_DIR/images/cards"

# Print working directory for verification
echo "Converting files in: $(pwd)"

for file in *.png; do
    # Skip if not a file
    [ -f "$file" ] || continue
    
    # Extract first character of value and suit
    value=$(echo "$file" | cut -d'_' -f1)
    suit=$(echo "$file" | cut -d'_' -f3 | cut -d'.' -f1 | cut -c1)
    
    # Handle numeric 10 before case statement
    if [ "$value" = "10" ]; then
        value="t"
    else
        # Convert word numbers to digits and face cards to letters
        case $value in
            "two") value="2" ;;
            "three") value="3" ;;
            "four") value="4" ;;
            "five") value="5" ;;
            "six") value="6" ;;
            "seven") value="7" ;;
            "eight") value="8" ;;
            "nine") value="9" ;;
            "ten") value="t" ;;
            "jack") value="j" ;;
            "queen") value="q" ;;
            "king") value="k" ;;
            "ace") value="a" ;;
        esac
    fi
    
    # Create new filename
    newfile="${value}${suit}.png"
    
    # Copy the file with new name
    cp "$file" "$newfile"
done
