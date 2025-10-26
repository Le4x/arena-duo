-- Fix 1: INFO_LEAKAGE - Remove player SELECT policy on questions table
-- Players should not query questions directly, only hosts
DROP POLICY IF EXISTS "Players can view questions without answers" ON public.questions;

-- Fix 2: MISSING_RLS - Allow users to set their own role once during signup
CREATE POLICY "Users can set their own role once"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id AND 
  NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = auth.uid()
  )
);

-- Fix 3: CLIENT_SIDE_AUTH - Enforce single team per user per session
ALTER TABLE public.teams ADD CONSTRAINT unique_user_per_session 
UNIQUE (user_id, session_id);

-- Fix 4: INPUT_VALIDATION - Add validation trigger for question choices
CREATE OR REPLACE FUNCTION public.validate_question_choices()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate choices structure for QCM questions
  IF NEW.type = 'qcm' THEN
    -- Choices must exist and be an array
    IF NEW.choices IS NULL OR jsonb_typeof(NEW.choices) != 'array' THEN
      RAISE EXCEPTION 'QCM questions must have choices as an array';
    END IF;
    
    -- Validate array length (2-6 choices)
    IF jsonb_array_length(NEW.choices) < 2 OR jsonb_array_length(NEW.choices) > 6 THEN
      RAISE EXCEPTION 'QCM questions must have between 2 and 6 choices';
    END IF;
    
    -- Validate each choice (must be string, 1-200 characters)
    IF EXISTS (
      SELECT 1 FROM jsonb_array_elements(NEW.choices) AS elem
      WHERE jsonb_typeof(elem) != 'string' 
        OR length(elem::text) < 3 
        OR length(elem::text) > 202
    ) THEN
      RAISE EXCEPTION 'Each choice must be a string between 1 and 200 characters';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_choices_trigger
  BEFORE INSERT OR UPDATE ON public.questions
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_question_choices();