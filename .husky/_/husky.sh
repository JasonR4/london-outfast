#!/usr/bin/env sh
# Minimal Husky init shim
# This is a lightweight fallback to avoid hook failures in environments
# where `npx husky init` hasn't created the default helper.

if [ -z "$husky_skip_init" ]; then
  if [ -f ~/.huskyrc ]; then
    . ~/.huskyrc
  fi
fi
