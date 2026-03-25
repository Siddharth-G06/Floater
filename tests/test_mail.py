from mail_generator import generate_email


def main():
    email = generate_email(
        vendor_name="ABC Suppliers",
        amount=25000,
        due_date="30 March 2026",
        mode="emergency",
        strategy="Request 5-day extension with partial payment of 10,000 now"
    )

    print("\n📧 GENERATED EMAIL:\n")
    print(email)


if __name__ == "__main__":
    main()