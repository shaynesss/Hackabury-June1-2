variable "region" {
  description = "AWS region to deploy into"
  type        = string
  default     = "us-east-1"
}

variable "instance_type" {
  description = "EC2 instance type (t3.micro and t2.micro are both free-tier eligible)"
  type        = string
  default     = "t3.micro"
}

variable "instance_name" {
  description = "Name tag applied to the instance"
  type        = string
  default     = "passpreview"
}

variable "ssh_allowed_cidr" {
  description = "CIDR block allowed to reach SSH port 22. Use your IP with /32 (find it via `curl ifconfig.me`)"
  type        = string
}

variable "key_name" {
  description = "Name of an existing EC2 key pair used for SSH access"
  type        = string
}
