terraform {
  required_version = ">= 1.3"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.region
}

# Latest Amazon Linux 2023 x86_64 AMI (free-tier eligible, Docker-ready).
data "aws_ssm_parameter" "al2023_ami" {
  name = "/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64"
}

resource "aws_security_group" "web" {
  name        = "${var.instance_name}-sg"
  description = "Allow inbound HTTP (80) and SSH (22)"

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.ssh_allowed_cidr]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Single instance in the default VPC/subnet. Assumes the account's default VPC
# still exists; public IP access is provided by the Elastic IP below.
resource "aws_instance" "web" {
  ami                         = data.aws_ssm_parameter.al2023_ami.value
  instance_type               = var.instance_type
  key_name                    = var.key_name
  vpc_security_group_ids      = [aws_security_group.web.id]
  associate_public_ip_address = true

  # Installs Docker + Compose on first boot. See user_data.sh.
  user_data = file("${path.module}/user_data.sh")

  tags = {
    Name = var.instance_name
  }
}

# Fixed public IP so the address survives instance stop/start and reboots.
# Free while attached to a running instance; detached EIPs incur charges.
resource "aws_eip" "web" {
  domain = "vpc"
}

resource "aws_eip_association" "web" {
  instance_id   = aws_instance.web.id
  allocation_id = aws_eip.web.id
}
