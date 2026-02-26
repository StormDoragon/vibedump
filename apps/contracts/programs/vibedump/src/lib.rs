use anchor_lang::prelude::*;

declare_id!("ViBeDuMp111111111111111111111111111111111");

#[program]
pub mod vibedump {
    use super::*;

    /// Initialize a new bonding curve for a vibe token
    pub fn initialize_pump(
        ctx: Context<InitializePump>,
        token_name: String,
        symbol: String,
        description: String,
        initial_supply: u64,
    ) -> Result<()> {
        let pump = &mut ctx.accounts.pump;
        pump.creator = *ctx.accounts.creator.key;
        pump.token_name = token_name;
        pump.symbol = symbol;
        pump.description = description;
        pump.initial_supply = initial_supply;
        pump.current_supply = initial_supply;
        pump.created_at = Clock::get()?.unix_timestamp;

        emit!(PumpCreated {
            pump: pump.key(),
            creator: pump.creator,
            token_name: pump.token_name.clone(),
            symbol: pump.symbol.clone(),
        });

        Ok(())
    }

    /// Buy tokens from bonding curve (increases price)
    pub fn buy(ctx: Context<BuyCurve>, amount_sol: u64) -> Result<()> {
        let pump = &mut ctx.accounts.pump;

        // Bonding curve formula: price = base_price * (current_supply + tokens_bought)
        // Simplified: 1 SOL = 1M tokens at start, decreases as supply increases
        let tokens_to_receive = calculate_tokens_for_sol(amount_sol, pump.current_supply);

        pump.current_supply = pump.current_supply.saturating_add(tokens_to_receive);
        pump.total_raised_sol = pump.total_raised_sol.saturating_add(amount_sol);

        emit!(TokensBought {
            pump: pump.key(),
            buyer: ctx.accounts.buyer.key(),
            amount_sol,
            tokens_received: tokens_to_receive,
        });

        Ok(())
    }

    /// Record on-chain proof of code vibe (commit hash + vibe score)
    pub fn record_vibe_proof(
        ctx: Context<RecordVibeProof>,
        code_hash: [u8; 32],
        vibe_score: u8,
        commit_hash: String,
    ) -> Result<()> {
        let proof = &mut ctx.accounts.vibe_proof;
        proof.user = *ctx.accounts.user.key;
        proof.code_hash = code_hash;
        proof.vibe_score = vibe_score;
        proof.commit_hash = commit_hash;
        proof.timestamp = Clock::get()?.unix_timestamp;

        emit!(VibeProofRecorded {
            proof: proof.key(),
            user: proof.user,
            vibe_score,
        });

        Ok(())
    }
}

/// Initialize pump curve account
#[derive(Accounts)]
pub struct InitializePump<'info> {
    #[account(init, payer = creator, space = 8 + 32 + 32 + 100 + 50 + 500 + 8 + 8 + 8 + 8)]
    pub pump: Account<'info, PumpCurve>,
    #[account(mut)]
    pub creator: Signer<'info>,
    pub system_program: Program<'info, System>,
}

/// Buy from bonding curve
#[derive(Accounts)]
pub struct BuyCurve<'info> {
    #[account(mut)]
    pub pump: Account<'info, PumpCurve>,
    #[account(mut)]
    pub buyer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

/// Record vibe proof on-chain
#[derive(Accounts)]
pub struct RecordVibeProof<'info> {
    #[account(init, payer = user, space = 8 + 32 + 32 + 1 + 100 + 8)]
    pub vibe_proof: Account<'info, VibeProof>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

/// Bonding curve state
#[account]
pub struct PumpCurve {
    pub creator: Pubkey,
    pub token_name: String,
    pub symbol: String,
    pub description: String,
    pub initial_supply: u64,
    pub current_supply: u64,
    pub total_raised_sol: u64,
    pub created_at: i64,
}

/// Vibe proof record
#[account]
pub struct VibeProof {
    pub user: Pubkey,
    pub code_hash: [u8; 32],
    pub vibe_score: u8,
    pub commit_hash: String,
    pub timestamp: i64,
}

/// Events
#[event]
pub struct PumpCreated {
    pub pump: Pubkey,
    pub creator: Pubkey,
    pub token_name: String,
    pub symbol: String,
}

#[event]
pub struct TokensBought {
    pub pump: Pubkey,
    pub buyer: Pubkey,
    pub amount_sol: u64,
    pub tokens_received: u64,
}

#[event]
pub struct VibeProofRecorded {
    pub proof: Pubkey,
    pub user: Pubkey,
    pub vibe_score: u8,
}

/// Bonding curve calculation (simplified)
fn calculate_tokens_for_sol(sol_amount: u64, current_supply: u64) -> u64 {
    // Base price: 1 SOL = 1M tokens when supply is low
    // Price increases as supply increases
    // Formula: tokens = 1_000_000 * sol / (1 + current_supply / 1_000_000)
    let base_tokens = 1_000_000;
    let denominator = 1 + (current_supply / base_tokens).max(1);
    (base_tokens * sol_amount) / denominator
}
