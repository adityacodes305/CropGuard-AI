from pathlib import Path
import shutil
import random

SOURCE = Path("plantvillage/data/raw/color")
DEST = Path("dataset")

TRAIN = DEST / "train"
VAL = DEST / "val"

VAL_RATIO = 0.2
random.seed(42)

print("Preparing PlantVillage dataset...")

if not SOURCE.exists():
    print("ERROR: Source dataset not found!")
    exit(1)

# Remove old prepared dataset if it exists
if DEST.exists():
    print("Removing old dataset folder...")
    shutil.rmtree(DEST)

TRAIN.mkdir(parents=True)
VAL.mkdir(parents=True)

classes = sorted([p for p in SOURCE.iterdir() if p.is_dir()])

print(f"Found {len(classes)} classes.\n")

total_train = 0
total_val = 0

for class_dir in classes:

    images = []

    for ext in ["*.jpg", "*.JPG", "*.jpeg", "*.JPEG", "*.png", "*.PNG"]:
        images.extend(class_dir.glob(ext))

    # Remove duplicates
    images = list(set(images))

    random.shuffle(images)

    split_index = int(len(images) * (1 - VAL_RATIO))

    train_images = images[:split_index]
    val_images = images[split_index:]

    train_class = TRAIN / class_dir.name
    val_class = VAL / class_dir.name

    train_class.mkdir(parents=True)
    val_class.mkdir(parents=True)

    for image in train_images:
        shutil.copy2(image, train_class / image.name)

    for image in val_images:
        shutil.copy2(image, val_class / image.name)

    total_train += len(train_images)
    total_val += len(val_images)

    print(
        f"{class_dir.name}: "
        f"{len(train_images)} train, "
        f"{len(val_images)} val"
    )

print("\n================================")
print("Dataset preparation complete!")
print("================================")

print(f"Training images:   {total_train}")
print(f"Validation images: {total_val}")
print(f"Total images:      {total_train + total_val}")

print(f"\nTrain folder: {TRAIN.resolve()}")
print(f"Val folder:   {VAL.resolve()}")
